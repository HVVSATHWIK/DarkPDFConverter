// Three.js Carousel Initialization

// Scene, Camera, Renderer
let scene, camera, renderer;
let cards = []; // This array will be populated with the card meshes
let carouselGroup; // To group cards for unified rotation
const clock = new THREE.Clock(); // For frame-rate independent animation
const cardDimensions = { width: 200, height: 300 };

let raycaster;
const mouse = new THREE.Vector2(); // To store normalized mouse coordinates
let intersectedObject = null; // To keep track of the currently hovered object
let isMouseOverCanvas = false; // Flag to check if mouse is over the canvas
const carouselRadius = 400; // Desktop radius

let activeCardForFileUpload = null; // To know which card initiated the upload
let pdfFileInput = null; // To store reference to the input element

const toolData = [
    { title: "Dark Mode Converter", iconPlaceholder: "DM" },
    { title: "Merge PDFs", iconPlaceholder: "MP" },
    { title: "Split PDF", iconPlaceholder: "SP" },
    { title: "Rotate PDF", iconPlaceholder: "RP" },
    { title: "Compress PDF", iconPlaceholder: "CP" },
    { title: "Convert to Image", iconPlaceholder: "CI" }
];

function createCardFrontTexture(title, iconPlaceholderText) { // RENAMED
    const canvas = document.createElement('canvas');
    const canvasWidth = 256; // For better texture quality
    const canvasHeight = 384; // canvasWidth * 1.5
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d');

    // Shadow (drawn on canvas)
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;

    // Card background
    ctx.fillStyle = '#3a3a3a'; // Medium-dark grey
    // Apply shadow before drawing the rectangle that casts it
    // To ensure shadow is "outside" the card, draw the shape that casts shadow first, then clear shadow for other elements
    ctx.fillRect(10, 10, canvasWidth - 25, canvasHeight - 25); // Main card shape, leave space for shadow to appear

    // Reset shadow for other elements
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Icon Placeholder (64x64 actual, scaled for canvas resolution)
    const iconSize = 64 * (canvasWidth / cardDimensions.width); // Scale icon size to canvas resolution
    const iconX = (canvasWidth / 2) - (iconSize / 2);
    const iconY = 40 * (canvasHeight / cardDimensions.height); // Scaled margin
    ctx.fillStyle = '#555555'; // Darker grey for placeholder
    ctx.fillRect(iconX, iconY, iconSize, iconSize);
    
    // Icon Placeholder Text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${24 * (canvasWidth / cardDimensions.width)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(iconPlaceholderText, canvasWidth / 2, iconY + iconSize / 2);

    // Title Text
    ctx.fillStyle = '#FFFFFF'; // White text
    const fontSize = 20 * (canvasWidth / cardDimensions.width); // Scale font size
    ctx.font = `bold ${fontSize}px Arial`; // Sans-serif font
    ctx.textAlign = 'center';
    // Position title below icon placeholder
    ctx.fillText(title, canvasWidth / 2, iconY + iconSize + (40 * (canvasHeight / cardDimensions.height)));

    return new THREE.CanvasTexture(canvas);
}

function createCardBackTexture(toolTitle) {
    const canvas = document.createElement('canvas');
    const canvasWidth = 256; // For better texture quality
    const canvasHeight = 384; // canvasWidth * 1.5 (same as front)
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d');

    // Card background (no main shadow for back)
    ctx.fillStyle = '#3a3a3a'; // Medium-dark grey
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Scaling helper for consistency with front if needed, or define fixed sizes for back
    const scaleFactorX = canvasWidth / cardDimensions.width;
    const scaleFactorY = canvasHeight / cardDimensions.height;

    // File Upload Area (Visual Placeholder)
    const uploadAreaX = 20 * scaleFactorX;
    const uploadAreaY = 40 * scaleFactorY;
    const uploadAreaWidth = canvasWidth - (40 * scaleFactorX);
    const uploadAreaHeight = 80 * scaleFactorY;
    
    ctx.fillStyle = '#4a4a4a'; // Light gray background for upload area
    ctx.fillRect(uploadAreaX, uploadAreaY, uploadAreaWidth, uploadAreaHeight);
    
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = '#777777';
    ctx.lineWidth = 2;
    ctx.strokeRect(uploadAreaX, uploadAreaY, uploadAreaWidth, uploadAreaHeight);
    ctx.setLineDash([]); // Reset line dash

    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${18 * Math.min(scaleFactorX, scaleFactorY)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText("Drop PDF Here", canvasWidth / 2, uploadAreaY + uploadAreaHeight / 2);

    // Adjustable Control (Visual Placeholder - e.g., a simple slider)
    const controlY = 170 * scaleFactorY; // Adjusted Y position
    const controlRailX = 40 * scaleFactorX;
    const controlRailWidth = canvasWidth - (80 * scaleFactorX);
    const controlRailHeight = 4 * scaleFactorY;
    const controlKnobRadius = 8 * Math.min(scaleFactorX, scaleFactorY);

    ctx.fillStyle = '#777777'; // Rail color
    ctx.fillRect(controlRailX, controlY - controlRailHeight / 2, controlRailWidth, controlRailHeight);
    
    ctx.beginPath(); // Knob
    ctx.arc(controlRailX + controlRailWidth / 3, controlY, controlKnobRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#BBBBBB'; // Knob color
    ctx.fill();
    
    ctx.font = ` ${14 * Math.min(scaleFactorX, scaleFactorY)}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText("Quality Setting (Placeholder)", canvasWidth / 2, controlY + controlKnobRadius + (15 * scaleFactorY) );


    // Go Button (Visual Placeholder)
    const buttonWidth = (canvasWidth / 2);
    const buttonHeight = 50 * scaleFactorY;
    const buttonX = (canvasWidth / 2) - (buttonWidth / 2);
    const buttonY = canvasHeight - (100 * scaleFactorY);

    ctx.fillStyle = '#3B82F6'; // Blue button color
    ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${20 * Math.min(scaleFactorX, scaleFactorY)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText("Go", canvasWidth / 2, buttonY + buttonHeight / 2);

    return new THREE.CanvasTexture(canvas);
}


function init() {
    // Scene
    scene = new THREE.Scene();

    // File Input
    pdfFileInput = document.getElementById('pdf-file-input');
    if (pdfFileInput) { // Ensure it exists before adding listener
        pdfFileInput.addEventListener('change', handleFileSelect, false);
    } else {
        console.error("PDF file input element not found!");
    }

    // Raycaster
    raycaster = new THREE.Raycaster();

    // Carousel Group
    carouselGroup = new THREE.Group();
    scene.add(carouselGroup);

    // Camera (Orthographic)
    const aspect = window.innerWidth / window.innerHeight;
    camera = new THREE.OrthographicCamera(
        window.innerWidth / -2, 
        window.innerWidth / 2, 
        window.innerHeight / 2, 
        window.innerHeight / -2, 
        1, 
        1000
    );
    camera.position.set(0, 0, 500); // Look directly at the origin from Z-axis
    camera.lookAt(0, 0, 0);

    // Renderer
    const canvas = document.getElementById('three-canvas');
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x1a1a1a); // Dark charcoal grey background
    // renderer.shadowMap.enabled = true; // Only if using Three.js light shadows

    const cardGeometry = new THREE.PlaneGeometry(cardDimensions.width, cardDimensions.height);

    toolData.forEach((tool, i) => {
        const angle = (i / toolData.length) * Math.PI * 2;
        
        const frontTexture = createCardFrontTexture(tool.title, tool.iconPlaceholder); // RENAMED call
        const backTexture = createCardBackTexture(tool.title);

        const cardMaterial = new THREE.MeshStandardMaterial({
            map: frontTexture, // Initial texture
            transparent: true,
            roughness: 0.7,
            metalness: 0.1
            // side: THREE.DoubleSide // Not strictly needed as we change map
        });
        const card = new THREE.Mesh(cardGeometry, cardMaterial);
        
        card.position.x = Math.cos(angle) * carouselRadius;
        card.position.y = Math.sin(angle) * carouselRadius;
        card.position.z = 0;
        
        // Initialize userData for interaction and animation state
        card.userData = {
            originalRotationX: card.rotation.x,
            targetRotationX: card.rotation.x,
            originalRotationY: card.rotation.y,
            targetRotationY: card.rotation.y,
            isHovered: false,
            isFlipped: false,
            toolData: tool,
            animationState: 'idle',
            frontTexture: frontTexture,
            backTexture: backTexture,
            textureUpdatedDuringFlip: false,
            selectedFile: null // For storing the selected PDF file
        };
        
        carouselGroup.add(card);
        cards.push(card);
    });

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); // Soft white light
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0, 1, 300); // Coming from above and slightly in front
    scene.add(directionalLight);
    
    // Event Listeners for Interaction
    renderer.domElement.addEventListener('mousemove', onMouseMove, false);
    renderer.domElement.addEventListener('mouseout', onMouseOut, false);
    renderer.domElement.addEventListener('click', onClick, false);

    // Handle Window Resize
    window.addEventListener('resize', onWindowResize, false);

    // Start Animation Loop
    animate();
    console.log("Three.js scene initialized with cards and interaction listeners.");
}

function onMouseMove(event) {
    isMouseOverCanvas = true;
    // Calculate mouse position in normalized device coordinates (-1 to +1) for raycaster
    // Adjusting for canvas position and size if it's not fullscreen
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

function onMouseOut() {
    isMouseOverCanvas = false;
    if (intersectedObject) {
        intersectedObject.userData.isHovered = false;
        if (intersectedObject.userData.animationState === 'idle' || 
           (intersectedObject.userData.isFlipped && intersectedObject.userData.animationState === 'idle')) {
            intersectedObject.userData.targetRotationX = intersectedObject.userData.originalRotationX;
        }
        // intersectedObject = null; // This is handled by the logic block in animate() if isMouseOverCanvas becomes false
    }
}

function onClick(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(cards, false);

    if (intersects.length > 0) {
        const clickedCard = intersects[0].object;

        // Reset previously intersected object's hover state if it's different
        if (intersectedObject && intersectedObject !== clickedCard) {
            intersectedObject.userData.isHovered = false;
            // Only reset tilt if idle and not the target of an ongoing click interaction
            if (intersectedObject.userData.animationState === 'idle') {
                 intersectedObject.userData.targetRotationX = intersectedObject.userData.originalRotationX;
            }
        }
        intersectedObject = clickedCard; // Set current card as intersected
        clickedCard.userData.isHovered = true; // Mark as hovered
        
        // Always apply hover tilt if not already flipping or awaiting flip from this click
        // This ensures the card tilts even if the click immediately leads to file input.
        if (clickedCard.userData.animationState === 'idle') {
             clickedCard.userData.targetRotationX = clickedCard.userData.originalRotationX + THREE.MathUtils.degToRad(15);
        }

        if (clickedCard.userData.isFlipped && clickedCard.userData.animationState === 'idle') {
            // Card is showing its back face and is stable, treat click as "upload"
            activeCardForFileUpload = clickedCard;
            console.log("Upload area clicked for tool:", activeCardForFileUpload.userData.toolData.title);
            if (pdfFileInput) { // Check if pdfFileInput is available
                pdfFileInput.value = null; // Reset to allow selecting the same file again
                pdfFileInput.click(); // Programmatically click the hidden file input
            }
        } else if (clickedCard.userData.animationState !== 'flipping' && clickedCard.userData.animationState !== 'awaiting_flip') {
            // If not flipped and stable, or not already flipping/awaiting, initiate flip sequence
            console.log("Initiating flip for:", clickedCard.userData.toolData.title);
            // Ensure tilt is applied if it wasn't already (e.g. quick click)
            clickedCard.userData.targetRotationX = clickedCard.userData.originalRotationX + THREE.MathUtils.degToRad(15);
            clickedCard.userData.animationState = 'awaiting_flip';
        }
    } else {
        // Clicked outside any card, reset previously intersected object if any
        if (intersectedObject) {
            intersectedObject.userData.isHovered = false;
            if (intersectedObject.userData.animationState === 'idle') {
                intersectedObject.userData.targetRotationX = intersectedObject.userData.originalRotationX;
            }
            intersectedObject = null;
        }
    }
}


function handleFileSelect(event) {
    if (!activeCardForFileUpload) return; // Should not happen if logic is correct

    const file = event.target.files[0];
    if (file) {
        console.log(`File selected for ${activeCardForFileUpload.userData.toolData.title}:`, file.name, `Size: ${file.size} bytes`);

        // Validate file size (10MB limit)
        const maxSize = 10 * 1024 * 1024; // 10 MB
        if (file.size > maxSize) {
            alert(`File "${file.name}" is too large (${(file.size / (1024*1024)).toFixed(2)} MB). Maximum size is 10 MB.`);
            // Reset the input value so user can select another (or same) file
            event.target.value = null;
            activeCardForFileUpload.userData.selectedFile = null; // Clear any previously stored file
            return;
        }

        // Store the file (or a reference) in the card's data
        activeCardForFileUpload.userData.selectedFile = file;
        alert(`Selected: ${file.name} for ${activeCardForFileUpload.userData.toolData.title}`);

        // TODO: Update card back texture to show filename (enhancement for later)
        // TODO: Potentially automatically proceed to "Go" or enable "Go" button
        
        // Reset the input value so that selecting the same file again still fires 'change'
        event.target.value = null; 
    } else {
        console.log("No file selected or selection cancelled for:", activeCardForFileUpload.userData.toolData.title);
        activeCardForFileUpload.userData.selectedFile = null; // Clear if no file chosen
    }
    // activeCardForFileUpload = null; // Optional: Reset after handling, or keep for context
}


function onWindowResize() {
    camera.left = window.innerWidth / -2;
    camera.right = window.innerWidth / 2;
    camera.top = window.innerHeight / 2;
    camera.bottom = window.innerHeight / -2;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();

    if (carouselGroup) {
        const rotationSpeed = (Math.PI * 2) / 60; // 1 RPM
        carouselGroup.rotation.z += rotationSpeed * delta;
    }

    // Raycasting and hover detection
    if (isMouseOverCanvas) { // Only raycast if mouse is over canvas
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(cards, false); // `cards` should be the array of card meshes

        if (intersects.length > 0) {
            const currentHover = intersects[0].object;
            if (intersectedObject !== currentHover) {
                if (intersectedObject) { 
                    intersectedObject.userData.isHovered = false;
                    if (intersectedObject.userData.animationState === 'idle') {
                        intersectedObject.userData.targetRotationX = intersectedObject.userData.originalRotationX;
                    } else if (intersectedObject.userData.isFlipped && intersectedObject.userData.animationState === 'idle') {
                       intersectedObject.userData.targetRotationX = intersectedObject.userData.originalRotationX;
                    }
                }
                intersectedObject = currentHover;
                if (intersectedObject.userData.animationState === 'idle') { // Only apply hover tilt if idle
                    intersectedObject.userData.targetRotationX = intersectedObject.userData.originalRotationX + THREE.MathUtils.degToRad(15);
                }
                intersectedObject.userData.isHovered = true;
            }
        } else { // Mouse is over canvas but not on any card
            if (intersectedObject) {
                intersectedObject.userData.isHovered = false;
                if (intersectedObject.userData.animationState === 'idle') {
                     intersectedObject.userData.targetRotationX = intersectedObject.userData.originalRotationX;
                } else if (intersectedObject.userData.isFlipped && intersectedObject.userData.animationState === 'idle') {
                    intersectedObject.userData.targetRotationX = intersectedObject.userData.originalRotationX;
                }
                intersectedObject = null;
            }
        }
    } else { // Mouse is not over canvas
        if (intersectedObject) {
            intersectedObject.userData.isHovered = false;
            if (intersectedObject.userData.animationState === 'idle') {
                intersectedObject.userData.targetRotationX = intersectedObject.userData.originalRotationX;
            } else if (intersectedObject.userData.isFlipped && intersectedObject.userData.animationState === 'idle') {
                intersectedObject.userData.targetRotationX = intersectedObject.userData.originalRotationX;
            }
            intersectedObject = null;
        }
    }

    // Apply animations to all cards
    cards.forEach(card => {
        // Tilt Animation (X-axis)
        card.rotation.x += (card.userData.targetRotationX - card.rotation.x) * 0.12;

        // Transition from Tilt to Flip
        if (card.userData.animationState === 'awaiting_flip') {
            if (Math.abs(card.rotation.x - card.userData.targetRotationX) < THREE.MathUtils.degToRad(2)) { 
                card.userData.animationState = 'flipping';
                card.userData.textureUpdatedDuringFlip = false; // Reset for current flip
                if (!card.userData.isFlipped) {
                    card.userData.targetRotationY = card.userData.originalRotationY + Math.PI; 
                } else {
                    card.userData.targetRotationY = card.userData.originalRotationY; 
                }
            }
        }
        
        // Flip Animation (Y-axis)
        if (card.userData.animationState === 'flipping') {
            card.rotation.y += (card.userData.targetRotationY - card.rotation.y) * 0.12; 

            // Texture swap logic
            if (!card.userData.textureUpdatedDuringFlip) {
                // Card is flipping towards back (e.g., rotation.y going from 0 to PI)
                if (card.userData.targetRotationY > card.userData.originalRotationY) { 
                    if (card.rotation.y >= card.userData.originalRotationY + Math.PI / 2) {
                        card.material.map = card.userData.backTexture;
                        card.material.needsUpdate = true;
                        card.userData.textureUpdatedDuringFlip = true;
                    }
                } 
                // Card is flipping towards front (e.g., rotation.y going from PI to 0)
                else if (card.userData.targetRotationY < card.userData.originalRotationY) {
                    if (card.rotation.y <= card.userData.originalRotationY + Math.PI / 2) {
                        card.material.map = card.userData.frontTexture;
                        card.material.needsUpdate = true;
                        card.userData.textureUpdatedDuringFlip = true;
                    }
                }
            }

            // Check for animation completion
            if (Math.abs(card.rotation.y - card.userData.targetRotationY) < THREE.MathUtils.degToRad(2)) { 
                card.userData.isFlipped = !card.userData.isFlipped; 
                card.userData.animationState = 'idle'; 
                // card.userData.textureUpdatedDuringFlip = false; // Not strictly needed here, as it's reset at start of flip
                if (!card.userData.isFlipped && !card.userData.isHovered) {
                    card.userData.targetRotationX = card.userData.originalRotationX;
                }
            }
        }
    });

    renderer.render(scene, camera);
}

// Initialize when the DOM is ready
if (document.readyState === 'loading') { // Loading hasn't finished yet
    document.addEventListener('DOMContentLoaded', init);
} else { // `DOMContentLoaded` has already fired
    init();
}

console.log("script.js loaded and Three.js setup initiated.");
