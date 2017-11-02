//todo: impl custom components approach

class PlaybackSpeed extends HTMLElement {

    // Monitor the 'name' attribute for changes.
    static get observedAttributes() {return ['name']; }

    constructor(){
        super();

        // Create a shadow root
        const shadow = this.attachShadow({mode: 'open'});

        // Create a standard img element and set it's attributes.
        const img = document.createElement('img');
        img.alt = this.getAttribute('data-name');
        img.src = this.getAttribute('data-img');
        img.width = '150';
        img.height = '150';
        img.className = 'product-img';

        // Add the image to the shadow root.
        shadow.appendChild(img);

        // Add an event listener to the image.
        img.addEventListener('click', () => {
            window.location = this.getAttribute('data-url');
        });

        // Create a link to the product.
        const link = document.createElement('a');
        link.innerText = this.getAttribute('data-name');
        link.href = this.getAttribute('data-url');
        link.className = 'product-name';

        // Add the link to the shadow root.
        shadow.appendChild(link);

    }

    // Respond to attribute changes.
    attributeChangedCallback(attr, oldValue, newValue) {
        if (attr == 'name') {
            this.textContent = `Hello, ${newValue}`;
        }
    }


}

// Define the new element
customElements.define('playback-speed', PlaybackSpeed);

// document.dispatchEvent(new CustomEvent(playbackChangeEventName, {detail: percentage}));
// document.addEventListener(playbackChangeEventName, ({detail: percentage}) => {});
