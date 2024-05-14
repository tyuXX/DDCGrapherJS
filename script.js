const canvas = document.getElementById("graph");
const ctx = canvas.getContext("2d");

// Textboxes and elements
const xLengthInput = document.getElementById("xLength");
const yLengthInput = document.getElementById("yLength");
const iterationsInput = document.getElementById("iterations");
const statusLabel = document.getElementById("statusLabel");
const dynamicCheckbox = document.getElementById("isDynamic");
const equationContainer = document.getElementById("equation-container");

let equations = [document.getElementById("equation1")];

function newEquation() {
  const newEquationId = `equation${equations.length + 1}`;
  const newEquationInput = document.createElement("input");
  newEquationInput.className = "textbox";
  newEquationInput.type = "text";
  newEquationInput.id = newEquationId;
  newEquationInput.placeholder = `Enter your equation here (e.g. sin(x) + x^2)`;

  // Add event listener for dynamic updates on new equations
  newEquationInput.addEventListener("change", () => {
    if (dynamicCheckbox.checked) {
      drawGraph();
    }
  });

  equationContainer.appendChild(newEquationInput);
  equations.push({
    box: newEquationInput,
    color: rgb(randomInt(1, 255), randomInt(1, 255), randomInt(1, 255)),
  });
}

// Call the drawGraph function when the dynamic checkbox is checked

xLengthInput.addEventListener("change", () => {
  if (dynamicCheckbox.checked) {
    drawGraph();
  }
});
yLengthInput.addEventListener("change", () => {
  if (dynamicCheckbox.checked) {
    drawGraph();
  }
});
iterationsInput.addEventListener("change", () => {
  if (dynamicCheckbox.checked) {
    drawGraph();
  }
});

equations[0].box.addEventListener("change", () => {
  if (dynamicCheckbox.checked) {
    drawGraph();
  }
});

// Add event listeners for dynamic updates
dynamicCheckbox.addEventListener("change", () => {
  if (dynamicCheckbox.checked) {
    drawGraph();
  }
});

// Function to evaluate the equation for a given x value
function evaluate(x, equation) {
  // Use mathjs to evaluate the expression with x as the variable
  try {
    return math.evaluate(equation, { x });
  } catch (error) {
    console.error("Error parsing equation:", error);
    return NaN; // Return NaN for invalid equations
  }
}

function drawGraph() {
  statusLabel.textContent = "Status: Calculating";

  // Clear the canvas before drawing
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  setTimeout(() => {
    const startTime = Date.now();
    equations.forEach((equation) => {
      let equationText = equation.box.value.toLowerCase();
      // Get axis lengths from textboxes (handle potential errors)
      let xLength, yLength, iterations;
      try {
        xLength = parseFloat(xLengthInput.value);
        yLength = parseFloat(yLengthInput.value);
        iterations = parseInt(iterationsInput.value);
      } catch (error) {
        console.error("Error parsing axis or iteration lengths:", error);
        // Set default values or display an error message
        xLength = 20;
        yLength = 20;
        iterations = 100;
      }

      // Calculate axis center based on canvas size and desired length
      const xmin = -xLength / 2;
      const xmax = xLength / 2;
      const ymin = -yLength / 2;
      const ymax = yLength / 2;

      const xScale = canvas.width / (xmax - xmin);
      const yScale = canvas.height / (ymax - ymin);

      ctx.beginPath();

      // Calculate function values for a range of x values
      for (let i = 0; i < iterations; i++) {
        const x = xmin + (i / (iterations - 1)) * (xmax - xmin);
        const y = evaluate(x, equationText);

        // Handle invalid results (e.g., NaN) by skipping that point
        if (isNaN(y)) continue;

        const px = (x - xmin) * xScale;
        const py = canvas.height - (y - ymin) * yScale;

        if (i === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      }

      ctx.stroke();

      // Draw axis lines and labels (optional)
      // ...

      const elapsedTime = Date.now() - startTime;
      statusLabel.textContent = `Status: Done (${elapsedTime}ms)`;
    });

    addLines();
  }, 1);
}

function addLines() {
  //Add axis lines

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(canvas.width, 0);
  ctx.lineTo(canvas.width, canvas.height);
  ctx.lineTo(0, canvas.height);
  ctx.stroke();

  //Add labels to the axis lines

  ctx.font = "12px Arial";
  ctx.fillStyle = "black";
  ctx.textAlign = "center";
  ctx.fillText("x", canvas.width / 2, canvas.height - 5);
  ctx.textAlign = "start";
  ctx.fillText("y", 5, 15);
  ctx.textAlign = "end";
  ctx.fillText("x", canvas.width - 5, 15);
  ctx.textAlign = "center";
  ctx.fillText("y", canvas.width / 2, 15);
}

//Export the drawn graph as a .png file
function ExportGraph() {
  const canvas = document.getElementById("graph");
  const dataUrl = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = "graph.png";
  link.click();
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Initialize the graph with default values
addLines();
