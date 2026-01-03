use wasm_bindgen::prelude::*;
use lopdf::{Document, Object, ObjectId};

// Enable nice panic messages
#[wasm_bindgen(start)]
pub fn main_js() {
    console_error_panic_hook::set_once();
}

#[wasm_bindgen(js_name = mergePdfsDirect)]
pub fn merge_pdfs_direct(js_files: JsValue) -> Result<Vec<u8>, JsValue> {
    let files: Vec<Vec<u8>> = serde_wasm_bindgen::from_value(js_files)?;
    
    if files.is_empty() {
        return Ok(vec![]);
    }

    // 1. Load Master
    let mut master_doc = Document::load_mem(&files[0])
        .map_err(|e| JsValue::from_str(&format!("Failed to load master PDF: {}", e)))?;

    // 2. Append others
    for (i, file_bytes) in files.iter().enumerate().skip(1) {
        let mut doc = Document::load_mem(&file_bytes)
            .map_err(|e| JsValue::from_str(&format!("Failed to load PDF {}: {}", i, e)))?;

        // Renumber to avoid collisions
        // Note: max_id might need to be recalculated if not tracked perfectly, 
        // but renumber_objects_with usually handles it relative to the offset.
        doc.renumber_objects_with(master_doc.max_id + 1);

        // Get pages BEFORE moving objects
        // We need to collect the Page Object IDs to add to the master's page tree.
        // We collect them into a Vec to avoid borrowing `doc` while modifying `master_doc`.
        let mut pages_to_add = Vec::new();
        for (_, page_id) in doc.get_pages() {
             pages_to_add.push(page_id);
        }

        // Merge Objects
        master_doc.objects.extend(doc.objects);

        // Merge Bookmarks/Outlines (Skipped for MVP)
        
        // Merge Pages (The tricky part)
        // We need to move pages from `doc` to `master_doc`'s Page Tree.
        // For MVP, simplistic approach: Get all pages from doc1, add to doc0.
        // lopdf's `get_pages()` returns the page structure.
        
        // We need to append the IDs of the pages from `doc` into the `Kids` array of `master_doc`'s root Pages object.
        // And update the `Count`.
        
        // Find master ID of Pages
        // This is simplified. Real world has nested page trees.
        // We assume a flat or standard structure for MVP.
        if let Ok(catalog_id) = master_doc.trailer.get(b"Root").and_then(|o| o.as_reference()) {
            if let Ok(catalog) = master_doc.get_object(catalog_id).and_then(|o| o.as_dict()) {
                if let Ok(pages_id) = catalog.get(b"Pages").and_then(|o| o.as_reference()) {
                     // Update the Pages object
                     if let Ok(pages_dict) = master_doc.get_object_mut(pages_id).and_then(|o| o.as_dict_mut()) {
                         // Add Kids
                         if let Ok(kids) = pages_dict.get_mut(b"Kids").and_then(|o| o.as_array_mut()) {
                             for pid in &pages_to_add {
                                 kids.push(Object::Reference(*pid));
                             }
                         }
                         
                         // Update Count
                         if let Ok(count) = pages_dict.get_mut(b"Count").and_then(|o| o.as_i64()) {
                             pages_dict.set(b"Count", Object::Integer(count + pages_to_add.len() as i64));
                         }
                     }
                }
            }
        }
    }
    
    // Recalculate max_id to ensure save is valid
    // master_doc.max_id = ... (handled mostly by usage)

    master_doc.prune_objects();

    let mut buffer = Vec::new();
    master_doc.save_to(&mut buffer)
        .map_err(|e| JsValue::from_str(&format!("Failed to save merged PDF: {}", e)))?;
        
    Ok(buffer)
}

#[wasm_bindgen(js_name = rotatePdf)]
pub fn rotate_pdf(file_bytes: &[u8], degrees: i32) -> Result<Vec<u8>, JsValue> {
    let mut doc = Document::load_mem(file_bytes)
        .map_err(|e| JsValue::from_str(&format!("Failed to load PDF: {}", e)))?;

    let rotation_delta = degrees % 360;

    for (_, page_id) in doc.get_pages() {
        if let Ok(content) = doc.get_object_mut(page_id) {
            if let Object::Dictionary(ref mut dict) = content {
                let current_rotation = dict.get(b"Rotate")
                    .and_then(|obj| obj.as_i64())
                    .unwrap_or(0);
                
                let new_rotation = (current_rotation + rotation_delta as i64) % 360;
                dict.set(b"Rotate", Object::Integer(new_rotation));
            }
        }
    }

    let mut buffer = Vec::new();
    doc.save_to(&mut buffer)
        .map_err(|e| JsValue::from_str(&format!("Failed to save rotated PDF: {}", e)))?;

    Ok(buffer)
}

#[wasm_bindgen(js_name = extractPages)]
pub fn extract_pages(file_bytes: &[u8], page_indices: Vec<u32>) -> Result<Vec<u8>, JsValue> {
    let doc = Document::load_mem(file_bytes)
        .map_err(|e| JsValue::from_str(&format!("Failed to load PDF: {}", e)))?;

    let all_pages = doc.get_pages(); // BTreeMap<u32, ObjectId>
    let all_page_ids: Vec<ObjectId> = all_pages.values().cloned().collect();
    
    let mut selected_ids = Vec::new();
    for &idx in &page_indices {
        if let Some(&id) = all_page_ids.get(idx as usize) {
            selected_ids.push(id);
        }
    }

    if selected_ids.is_empty() {
        return Err(JsValue::from_str("No valid pages selected"));
    }

    // Create a new document containing ONLY the selected pages.
    // Easiest Loop:
    // 1. Clone doc (expensive but simpler for logic).
    // 2. Adjust root Pages object to only have Kids = selected_ids.
    // 3. Prune.
    
    let mut final_doc = doc.clone();
    
    // Find the ROOT Pages object
    let catalog_id = final_doc.trailer.get(b"Root")
        .and_then(|o| o.as_reference())
        .map_err(|_| JsValue::from_str("Root not found"))?;
        
    let catalog = final_doc.get_object(catalog_id)
        .and_then(|o| o.as_dict())
        .map_err(|_| JsValue::from_str("Catalog is not a dictionary"))?;
        
    let pages_id = catalog.get(b"Pages")
        .and_then(|o| o.as_reference())
        .map_err(|_| JsValue::from_str("Pages not found"))?;

    // Update Pages dictionary
    let pages_dict = final_doc.get_object_mut(pages_id)
        .and_then(|o| o.as_dict_mut())
        .map_err(|_| JsValue::from_str("Pages object is not a dictionary"))?;

    // Reset Kids to our selected list
    let kids_array: Vec<Object> = selected_ids.iter().map(|&id| Object::Reference(id)).collect();
    pages_dict.set(b"Kids", Object::Array(kids_array));
    
    // Update Count
    pages_dict.set(b"Count", Object::Integer(selected_ids.len() as i64));

    // Prune unused
    final_doc.prune_objects();

    let mut buffer = Vec::new();
    final_doc.save_to(&mut buffer)
        .map_err(|e| JsValue::from_str(&format!("Failed to save extracted PDF: {}", e)))?;
        
    Ok(buffer)
}
