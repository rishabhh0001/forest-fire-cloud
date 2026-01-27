/**
 * Custom Dropdown Component
 * Replaces native <select> with a custom div-based UI
 */
class CustomDropdown {
    constructor(selectElement) {
        this.select = selectElement;
        this.options = Array.from(selectElement.options);
        this.init();
    }

    init() {
        // Hide original select
        this.select.style.display = 'none';

        // Create container
        this.container = document.createElement('div');
        this.container.className = 'custom-select-container';

        // Create selected display (trigger)
        this.trigger = document.createElement('div');
        this.trigger.className = 'custom-select-trigger';
        this.trigger.innerHTML = `
            <span>${this.options[this.select.selectedIndex].text}</span>
            <i class="ph ph-caret-down"></i>
        `;

        // Create options list
        this.optionsList = document.createElement('div');
        this.optionsList.className = 'custom-options';

        this.options.forEach((opt, index) => {
            const option = document.createElement('div');
            option.className = 'custom-option';
            if (index === this.select.selectedIndex) option.classList.add('selected');
            option.textContent = opt.text;
            option.dataset.value = opt.value;

            option.addEventListener('click', () => {
                this.selectOption(index);
            });

            this.optionsList.appendChild(option);
        });

        this.container.appendChild(this.trigger);
        this.container.appendChild(this.optionsList);

        // Insert after select
        this.select.parentNode.insertBefore(this.container, this.select.nextSibling);

        // Event Listeners
        this.trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggle();
        });

        document.addEventListener('click', () => {
            this.close();
        });
    }

    toggle() {
        this.container.classList.toggle('open');
    }

    close() {
        this.container.classList.remove('open');
    }

    selectOption(index) {
        // Update original select
        this.select.selectedIndex = index;

        // Trigger change event on original select so listeners fire
        const event = new Event('change');
        this.select.dispatchEvent(event);

        // Update UI
        this.trigger.querySelector('span').textContent = this.options[index].text;

        this.optionsList.querySelectorAll('.custom-option').forEach(opt => opt.classList.remove('selected'));
        this.optionsList.children[index].classList.add('selected');

        this.close();
    }
}

// Global initializer
window.initCustomDropdowns = () => {
    document.querySelectorAll('select:not(.custom-initialized)').forEach(select => {
        new CustomDropdown(select);
        select.classList.add('custom-initialized');
    });
};
