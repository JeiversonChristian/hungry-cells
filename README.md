# Hungry Cells 🦠

**Hungry Cells** is a responsive, canvas-based web simulation built with HTML, CSS, and JavaScript that models a dynamic ecosystem of plants, herbivores, and predators.

## 🚀 Features

- **HTML5 Canvas Rendering:** Optimized for high performance and smooth graphics, allowing thousands of entities to be drawn without freezing the browser.
- **Modular Architecture:** Built with ES6 JavaScript modules (`import`/`export`) for clean, maintainable, and scalable code.
- **Responsive Design:** A dark-themed UI that adapts seamlessly to mobile phones, tablets, desktops, and smart TVs.
- **Interactive UI Overlays:**
  - Play/Pause and Reset controls.
  - Collapsible Configuration Panel to set the initial number of entities.
  - Collapsible Live Stats Panel to track population counts in real-time.
- **Three Entity Types:**
  - 🌿 **Plants (Green):** Base of the food chain (Radius: 5).
  - 💧 **Herbivores (Blue):** Feed on plants (Radius: 10).
  - 🔴 **Predators (Red):** Feed on herbivores (Radius: 20).

## 📁 Project Structure

\`\`\`text
hungry-cells/
├── index.html          # Landing page with project title and start button
├── simulation.html     # Main simulation interface and canvas
├── css/
│   └── style.css       # Dark-themed, responsive styles
└── js/
    ├── app.js          # Main simulation controller and animation loop
    ├── Plant.js        # Plant entity class
    ├── Herbivore.js    # Herbivore entity class
    └── Predator.js     # Predator entity class
\`\`\`

## ⚙️ How to Run

Because this project uses **JavaScript ES6 Modules** (`type="module"`), you cannot simply double-click the HTML files to open them directly in the browser (due to CORS policies). 

To run the simulation locally:
1. Clone this repository.
2. Open the `hungry-cells` folder in your code editor (e.g., VS Code).
3. Start a local development server (if using VS Code, the **Live Server** extension is highly recommended).
4. Open the generated `localhost` link in your browser.

## 🚧 Future Implementations (Roadmap)

- [ ] Implement Brownian/erratic movement for cells.
- [ ] Add collision detection and spatial partitioning for optimized calculations.
- [ ] Implement feeding mechanics (Herbivores eat Plants, Predators eat Herbivores).
- [ ] Add energy/stamina decay and reproduction systems.

## 👨‍💻 Author

Developed by Jeiverson Christian Ventura Miranda dos Santos.