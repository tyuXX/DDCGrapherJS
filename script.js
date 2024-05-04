const canvas = document.getElementById("graph");
const ctx = canvas.getContext("2d");

// Textboxes for axis lengths
const xLengthInput = document.getElementById("xLength");
const yLengthInput = document.getElementById("yLength");
const iterationsInput = document.getElementById("iterations");
const statusLabel = document.getElementById("statusLabel");

let equations = [document.getElementById("equation1")];

function newEquation() {
  document.body.innerHTML += `<input class="textbox" type="text" id="equation${
    equations.length + 1
  }" placeholder="Enter your equation here (e.g. sin(x) + x^2)"></input>`;
  equations.push(document.getElementById(`equation${equations.length + 1}`));
}

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
      let equationText = equation.value.toLowerCase();
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
  }, 1);
}
