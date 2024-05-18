const canvas = document.getElementById("graph");
const ctx = canvas.getContext("2d");
ctx.lineWidth = 2;

// Textboxes and elements
const xLengthInput = document.getElementById("xLength");
const yLengthInput = document.getElementById("yLength");
const iterationsInput = document.getElementById("iterations");
const statusLabel = document.getElementById("statusLabel");
const dynamicCheckbox = document.getElementById("isDynamic");
const equationContainer = document.getElementById("equation-container");
const sideBar = document.getElementById("sidebar");
const graphHistory = document.getElementById("graphHistory");
const themeButton = document.getElementById("setTheme");
const fixScalingCheckbox = document.getElementById("fixScaling");

//Variables
let equations = [
  { box: document.getElementById("equation1"), r: 0, g: 0, b: 0 },
];
let isSidebar = false;
let theme = 1;
let center = {x:0,y:0};

// Call the drawGraph function when the dynamic checkbox is checked
xLengthInput.addEventListener("change", dCheck);
xLengthInput.addEventListener("change", fCheck);
yLengthInput.addEventListener("change", dCheck);
yLengthInput.addEventListener("change", fCheck);
iterationsInput.addEventListener("change", dCheck);
equations[0].box.addEventListener("change", dCheck);
dynamicCheckbox.addEventListener("change", dCheck);

function dCheck(){
  if (dynamicCheckbox.checked) {
    drawGraph();
  }
}

function fCheck(){
  if (fixScalingCheckbox.checked) {
    yLengthInput.textContent = xLengthInput.textContent * (canvas.height / canvas.width);
  }
}

function newEquation() {
  const rc = randomInt(10, 255);
  const gc = randomInt(10, 255);
  const bc = randomInt(10, 255);

  const newEquationId = `equation${equations.length + 1}`;
  const newEquationInput = document.createElement("input");
  newEquationInput.className = "equationtbox";
  newEquationInput.type = "text";
  newEquationInput.id = newEquationId;
  newEquationInput.placeholder = `Enter your equation here (e.g. sin(x) + x^2)`;
  newEquationInput.style.backgroundColor =
    "#" + rc.toString(16) + gc.toString(16) + bc.toString(16);

  // Add event listener for dynamic updates on new equations
  newEquationInput.addEventListener("change", dCheck);

  equationContainer.appendChild(newEquationInput);
  equations.push({
    box: newEquationInput,
    r: rc,
    g: gc,
    b: bc,
  });
}

function clearEquations() {
  equationContainer.innerHTML = "";
  equations = [];
  newEquation();
  equations[0].r = 0;
  equations[0].g = 0;
  equations[0].b = 0;
  equations[0].box.style.backgroundColor = "#3b3b3b";
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
  addLines();

  //Reset center point
  center = {x:0,y:0};

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
      const xmin = center.x - (xLength / 2);
      const xmax = center.x + (xLength / 2);
      const ymin = center.y - (yLength / 2);
      const ymax = center.y + (yLength / 2);

      const xScale = canvas.width / (xmax - xmin);
      const yScale = canvas.height / (ymax - ymin);

      ctx.strokeStyle =
        "#" +
        equation.r.toString(16) +
        equation.b.toString(16) +
        equation.g.toString(16);

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
    });

    // Calculate elapsed time
    const elapsedTime = Date.now() - startTime;
    statusLabel.textContent = `Status: Done (${elapsedTime}ms)`;

    //Add history
    graphHistory.textContent += `\n\nEqs:\n`;
    let eqid = 1;
    equations.forEach((equation) => {
      graphHistory.textContent += `Eq#${eqid}:"${equation.box.textContent}";`;
      eqid++;
    });
    graphHistory.textContent += `GI:"${canvas.toDataURL("image/png")}"`;
  }, 1);
}

function addLines() {
  //Add axis lines

  ctx.strokeStyle = "#316DCA";

  ctx.beginPath();
  ctx.moveTo(0, canvas.height / 2);
  ctx.lineTo(canvas.width, canvas.height / 2);
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.stroke();

  //Add labels to the axis lines

  ctx.font = "12px Arial";
  ctx.fillStyle = "#5E94CA";
  ctx.textAlign = "center";
  ctx.fillText("y", canvas.width / 2, canvas.height - 5);
  ctx.textAlign = "start";
  ctx.fillText("x", 5, canvas.height / 2);
  ctx.textAlign = "end";
  ctx.fillText("x", canvas.width - 5, canvas.height / 2);
  ctx.textAlign = "center";
  ctx.fillText("y", canvas.width / 2, 15);

  ctx.strokeStyle = "black";
  ctx.fillStyle = "black";
}

//Export the drawn graph as a .png file
function ExportGraphImage() {
  const dataUrl = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = "graph.png";
  link.click();
}

//Export the drawn graph as a .txt file
function ExportGraphText() {
  const link = document.createElement("a");
  link.href = "data:text/plain;charset=utf-8," + StringfyEqs();
  link.download = "graph.txt";
  link.click();
}

//Import a .txt file and draw the graph
function ImportGraphText() {
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = ".txt";
  fileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      LoadString(text);
      drawGraph();
    };
    reader.readAsText(file);
  });
  fileInput.click();
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

function StringfyEqs() {
  if (xLengthInput.value == "") {
    xLengthInput.value = 20;
  }
  if (yLengthInput.value == "") {
    yLengthInput.value = 20;
  }
  if (iterationsInput.value == "") {
    iterationsInput.value = 100;
  }
  let rs = `${xLengthInput.value}:${yLengthInput.value}:${iterationsInput.value};`;
  equations.forEach((equation) => {
    rs += equation.box.value + ";";
  });
  rs.trimEnd(";");
  console.log(rs);
  return btoa(rs);
}

function LoadString(string) {
  clearEquations();
  const eqs = atob(string).split(";");
  xLengthInput.value = eqs[0].split(":")[0];
  yLengthInput.value = eqs[0].split(":")[1];
  iterationsInput.value = eqs[0].split(":")[2];
  eqs.shift();
  for (let i = 1; i < eqs.length - 1; i++) {
    newEquation();
  }

  equations.forEach((equation, index) => {
    equation.box.value = eqs[index];
  });
}

function setTheme(id) {
  switch (id) {
    case 1:
      //the default theme from style.css
      document.body.style.backgroundColor = "#222";
      document.body.style.color = "#fff";
      document.getElementById("graph").style.backgroundColor = "#333";
      document.getElementById("graph").style.color = "#fff";
      document.getElementById("sidebar").style.backgroundColor = "#333";
      document.getElementById("sidebar").style.color = "#fff";
      document.getElementById("equation-container").style.backgroundColor =
        "#333";
      document.getElementById("equation-container").style.backgroundColor = "#fff";
      document.getElementById("statusLabel").style.color = "#fff";
      document.getElementById("xLength").style.backgroundColor = "#fff";
      document.getElementById("yLength").style.backgroundColor = "#fff";
      document.getElementById("iterations").style.backgroundColor = "#fff";
      document.getElementById("dynamicCheckbox").style.backgroundColor = "#fff";
      document.getElementById("newEquationButton").style.backgroundColor = "#fff";
      document.getElementById("clearEquationsButton").style.backgroundColor = "#fff";
      document.getElementById("exportGraphImageButton").style.backgroundColor = "#fff";
      document.getElementById("exportGraphTextButton").style.backgroundColor = "#fff";
      document.getElementById("importGraphTextButton").style.backgroundColor = "#fff";
      document.getElementById("sidebarButton").style.backgroundColor = "#fff";
      document.getElementById("themeButton").style.backgroundColor = "#fff";
      document.getElementById("themeButton").style.backgroundColor = "#333";
      break;
    case 2:
      //the dark theme
      document.body.style.backgroundColor = "#222";
      document.body.style.color = "#fff";
      document.getElementById("graph").style.backgroundColor = "#333";
      document.getElementById("graph").style.color = "#fff";
      document.getElementById("sidebar").style.backgroundColor = "#333";
      document.getElementById("sidebar").style.color = "#fff";
      document.getElementById("equation-container").style.backgroundColor =
        "#333";
      document.getElementById("equation-container").style.color = "#fff";
      document.getElementById("statusLabel").style.color = "#fff";
      document.getElementById("xLength").style.backgroundColor = "#fff";
      document.getElementById("yLength").style.backgroundColor = "#fff";
      document.getElementById("iterations").style.backgroundColor = "#fff";
      document.getElementById("dynamicCheckbox").style.backgroundColor = "#fff";
      document.getElementById("newEquationButton").style.backgroundColor = "#fff";
      document.getElementById("clearEquationsButton").style.backgroundColor = "#fff";
      document.getElementById("exportGraphImageButton").style.backgroundColor = "#fff";
      document.getElementById("exportGraphTextButton").style.backgroundColor = "#fff";
      document.getElementById("importGraphTextButton").style.backgroundColor = "#fff";
      document.getElementById("sidebarButton").style.backgroundColor = "#fff";
      document.getElementById("themeButton").style.backgroundColor = "#fff";
      document.getElementById("themeButton").style.backgroundColor = "#333";
      break;
    case 3:
      //the light theme
      document.body.style.backgroundColor = "#fff";
      document.body.style.color = "#000";
      document.getElementById("graph").style.backgroundColor = "#eee";
      document.getElementById("graph").style.color = "#000";
      document.getElementById("sidebar").style.backgroundColor = "#eee";
      document.getElementById("sidebar").style.color = "#000";
      document.getElementById("equation-container").style.backgroundColor =
        "#eee";
      document.getElementById("equation-container").style.color = "#000";
      document.getElementById("statusLabel").style.color = "#000";
      document.getElementById("xLength").style.backgroundColor = "#000";
      document.getElementById("yLength").style.backgroundColor = "#000";
      document.getElementById("iterations").style.backgroundColor = "#000";
      document.getElementById("dynamicCheckbox").style.backgroundColor = "#000";
      document.getElementById("newEquationButton").style.backgroundColor = "#000";
      document.getElementById("clearEquationsButton").style.backgroundColor = "#000";
      document.getElementById("exportGraphImageButton").style.backgroundColor = "#000";
      document.getElementById("exportGraphTextButton").style.backgroundColor = "#000";
      document.getElementById("importGraphTextButton").style.backgroundColor = "#000";
      document.getElementById("sidebarButton").style.backgroundColor = "#000";
      document.getElementById("themeButton").style.backgroundColor = "#000";
      document.getElementById("themeButton").style.backgroundColor = "#eee";
      break;
    default:
      break;
  }
}

function ThemeToggle() {
  theme++;
  theme %= 4;
  setTheme(theme);
}

//String compression funtion

// Initialize the graph with default values
addLines();
