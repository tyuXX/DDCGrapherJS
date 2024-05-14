const canvas = document.getElementById("graph");
const ctx = canvas.getContext("2d");

// Textboxes and elements
const xLengthInput = document.getElementById("xLength");
const yLengthInput = document.getElementById("yLength");
const iterationsInput = document.getElementById("iterations");
const statusLabel = document.getElementById("statusLabel");
const dynamicCheckbox = document.getElementById("isDynamic");
const equationContainer = document.getElementById("equation-container");
const sideBar = document.getElementById("sidebar");
const graphHistory = document.getElementById("graphHistory");

//Variables
let equations = [{box:document.getElementById("equation1"),r:0,g:0,b:0}];
let isSidebar = false;

function newEquation() {
  const newEquationId = `equation${equations.length + 1}`;
  const newEquationInput = document.createElement("input");
  newEquationInput.className = "equationtbox";
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
    r:randomInt(10,255),
    g:randomInt(10,255),
    b:randomInt(10,255)
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

      console.log("color is" + equation.r.toString() + equation.b.toString() + equation.g.toString());

      ctx.strokeStyle = equation.r.toString() + equation.b.toString() + equation.g.toString();

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

    //Add history
    graphHistory.textContent+=`\n\nEquations:\n`
    let eqid = 1;
    equations.forEach((equation) =>{
      graphHistory.textContent+=`Eq#${eqid}:${equation.box.textContent};`
      eqid++;
    });
  }, 1);
}

function addLines() {
  //Add axis lines

  ctx.strokeStyle = "red"

  ctx.beginPath();
  ctx.moveTo(0, canvas.height/2);
  ctx.lineTo(canvas.width, canvas.height/2);
  ctx.moveTo(canvas.width/2, 0);
  ctx.lineTo(canvas.width/2, canvas.height);
  ctx.stroke();

  //Add labels to the axis lines

  
  ctx.font = "12px Arial";
  ctx.fillStyle = "blue";
  ctx.textAlign = "center";
  ctx.fillText("y", canvas.width / 2, canvas.height - 5);
  ctx.textAlign = "start";
  ctx.fillText("x", 5, canvas.height /2);
  ctx.textAlign = "end";
  ctx.fillText("x", canvas.width - 5, canvas.height /2);
  ctx.textAlign = "center";
  ctx.fillText("y", canvas.width / 2, 15);
}

//Export the drawn graph as a .png file
function ExportGraph() {
  const dataUrl = canvas.toDataURL("image/png");
  const link = document.createElement("placeholder");
  link.href = dataUrl;
  link.download = "graph.png";
  link.click();
}

//Random integer
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function SidebarToggle() {
  if (isSidebar) {
    sideBar.style.display = "none";
    isSidebar = false;
    return;
  }
  sideBar.style.display = "block";
  isSidebar = true;
}

// Initialize the graph with default values
addLines();
