const resetButton = document.querySelector('.reset-button');
const runButton = document.querySelector('.run-sensehat');
const pixelCanvas = document.querySelector('.pixel-canvas');
const quickFill = document.querySelector('.quick-fill');
const eraseMode = document.querySelector('.erase-mode');
const drawMode = document.querySelector('.draw-mode');
const colorInput = document.querySelector("#picker-input")
const colorInputButton = document.querySelector("#picker-button")
const toolContainer = document.getElementById("tools");
const tools = toolContainer.getElementsByClassName("tool");

const paths = []
let currColor = 'white'

function makeGrid() {
  let gridHeight = 7;
  let gridWidth = 7;
  // If grid already present, clears any cells that have been filled in
  while (pixelCanvas.firstChild) {
    pixelCanvas.removeChild(pixelCanvas.firstChild);
  }
  // Creates rows and cells
  for (let i = 0; i <= gridHeight; i++) {
    let gridRow = document.createElement('tr');
    pixelCanvas.appendChild(gridRow);
    for (let j = 0; j <= gridWidth; j++) {
      let gridCell = document.createElement('td');
      gridCell.style.backgroundColor = "000000"
      paths.push({
        x: j,
        y: i,
        pixel: gridRow.appendChild(gridCell)
      })
      // Fills in cell with selected color upon mouse press ('mousedown', unlike 'click', doesn't also require release of mouse button)
      gridCell.addEventListener('mousedown', function () {
        // const color = document.querySelector('.color-picker').value;
        this.style.backgroundColor = currColor;
      })
    }
  }
}

makeGrid();

resetButton.addEventListener('click', function () {
  // Change to use color instead of redrawing grid.
  pixelCanvas.querySelectorAll('td').forEach(td => td.style.backgroundColor = "#000000");
});

// Done button
runButton.addEventListener('click', function () {
  const sendData = []
  paths.forEach(td => {
    const col = td.pixel.style.backgroundColor
    const rgbValues = col.replace("rgb(", "").replace(")", "").split(",")
    const color = {
      r: rgbValues[0],
      g: rgbValues[1],
      b: rgbValues[2]
    }
    const x = td.x
    const y = td.y

    const final = {
      color,
      x,
      y
    }

    sendData.push(final)
  })

  // convert data to json
  const json = JSON.stringify(sendData)

  // sending values to the api created by the python server
  fetch("/api/set-pixels", {
    method: "POST",
    headers: {
      'Content-Length': json.length
    },
    body: json
  })
});

// Enables color dragging with selected color (code for filling in single cell is above). (No click on 'draw' mode needed; this is default mode)
let down = false; // Tracks whether or not mouse pointer is pressed

// Listens for mouse pointer press and release on grid. Changes value to true when pressed, but sets it back to false as soon as released
pixelCanvas.addEventListener('mousedown', function (e) {
  down = true;
  pixelCanvas.addEventListener('mouseup', function () {
    down = false;
  });
  // Ensures cells won't be colored if grid is left while pointer is held down
  pixelCanvas.addEventListener('mouseleave', function () {
    down = false;
  });

  pixelCanvas.addEventListener('mouseover', function (e) {
    // 'color' defined here rather than globally so JS checks whether user has changed color with each new mouse press on cell
    // While mouse pointer is pressed and within grid boundaries, fills cell with selected color. Inner if statement fixes bug that fills in entire grid
    if (down) {
      // 'TD' capitalized because element.tagName returns upper case for DOM trees that represent HTML elements
      if (e.target.tagName === 'TD') {
        e.target.style.backgroundColor = currColor;
      }
    }
  });
});

// Adds color-fill functionality. e.preventDefault(); intercepts page refresh on button click
quickFill.addEventListener('click', function (e) {
  e.preventDefault();
  pixelCanvas.querySelectorAll('td').forEach(td => td.style.backgroundColor = currColor);
});

// Removes color from cell upon double-click
pixelCanvas.addEventListener('dblclick', e => {
  e.target.style.backgroundColor = "000000";
});

// NONDEFAULT DRAW AND ERASE MODES:

// Allows for drag and single-cell erasing upon clicking 'erase' button. Code for double-click erase functionality (Without entering erase mode) is above. Also note 'down' was set to false in variable above
eraseMode.addEventListener('click', function () {
  // Enables drag erasing while in erase mode
  pixelCanvas.addEventListener('mousedown', function (e) {
    down = true;
    pixelCanvas.addEventListener('mouseup', function () {
      down = false;
    });
    // Ensures cells won't be erased if grid is left while pointer is held down
    pixelCanvas.addEventListener('mouseleave', function () {
      down = false;
    });
    pixelCanvas.addEventListener('mouseover', function (e) {
      // While mouse pointer is pressed and within grid boundaries, empties cell contents. Inner if statement fixes bug that fills in entire grid
      if (down) {
        if (e.target.tagName === 'TD') {
          e.target.style.backgroundColor = "000000";
        }
      }
    });
  });
  // Enables single-cell erase while in erase mode
  pixelCanvas.addEventListener('mousedown', function (e) {
    e.target.style.backgroundColor = "000000";
  });
});

// intialise the color picker
const colorPicker = new iro.ColorPicker("#color-picker", {
  // Set the size of the color picker
  width: 180,
  borderWidth: 2,
  layout: [
    {
      component: iro.ui.Wheel,
      options: {
        borderColor: '#ffffff'
      }
    },
    {
      component: iro.ui.Slider,
      options: {
        borderColor: '#ffffff'
      }
    }
  ]
});

colorPicker.on(['color:init', 'color:change'], color => {
  currColor = color.hexString
  colorInput.value = currColor
})

colorInputButton.onclick = () => {
  colorPicker.color.hexString = colorInput.value
}

// Allows user to return to (default) draw mode after using 'erase' button. Note 'down' was set to false in variable above
drawMode.addEventListener('click', function () {
  pixelCanvas.addEventListener('mousedown', function (e) {
    down = true;
    pixelCanvas.addEventListener('mouseup', function () {
      down = false;
    });
    // Ensures cells won't be colored if grid is left while pointer is held down
    pixelCanvas.addEventListener('mouseleave', function () {
      down = false;
    });
    pixelCanvas.addEventListener('mouseover', function (e) {
      // While mouse pointer is pressed and within grid boundaries, fills cell with selected color. Inner if statement fixes bug that fills in entire grid
      if (down) {
        if (e.target.tagName === 'TD') {
          e.target.style.backgroundColor = currColor;
        }
      }
    });
  });
  // Enables single-cell coloring while in draw mode
  pixelCanvas.addEventListener('mousedown', function (e) {
    if (e.target.tagName !== 'TD') return;
    e.target.style.backgroundColor = currColor;
  });
});



// Loop through the buttons and add the active class to the current/clicked button
for (var i = 0; i < tools.length; i++) {
  tools[i].addEventListener("click", function() {
    var current = document.getElementsByClassName("active");
    current[0].className = current[0].className.replace(" active", "");
    this.className += " active";
  });
}