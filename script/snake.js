const playGround = document.querySelector('.snake__playground');
const settings = document.querySelector('.settings');
const pointsViewDiv = document.querySelector('.points-view');
const pointsCounterView = document.querySelector('.points-view__counter');
const styleDoc = document.documentElement.style;

let basicDirectors = {
  top: 0,
  left: -1,
  down: 0,
  right: 1,
};

const basicDifficults = {
  Easy: 'Easy',
  Medium: 'Medium',
  Hard: 'Hard',
};

const defaultSettings = {
  actualDifficult: basicDifficults.Easy,
  playgroundSize: 0,
  playgroundFullSize: 0,
  foodId: 0,
  gameSpeed: 400,
  points: 0,
  startSnakeLenght: 4,
  playgroundBorderPositionsTop: [],
  playgroundBorderPositionsLeft: [1],
  playgroundBorderPositionsDown: [],
  playgroundBorderPositionsRight: [],
  actualDirector: basicDirectors.left,
  newDirector: basicDirectors.left,
};

const gameSettings = Object.assign({}, defaultSettings);

let snakePosition = [];

const testNewDirectIsOppositeToActualDirector = newDirector =>
  (newDirector === basicDirectors.top &&
    gameSettings.actualDirector === basicDirectors.down) ||
  (newDirector === basicDirectors.right &&
    gameSettings.actualDirector === basicDirectors.left) ||
  (newDirector === basicDirectors.down &&
    gameSettings.actualDirector === basicDirectors.top) ||
  (newDirector === basicDirectors.left &&
    gameSettings.actualDirector === basicDirectors.right);

const testActualDirectIsHorizontal = () =>
  gameSettings.actualDirector !== basicDirectors.top &&
  gameSettings.actualDirector !== basicDirectors.down;

function addSnakeClassToElement(elementId, head = false) {
  const snakeElement = document.getElementById(elementId);

  snakeElement.classList.add('snake__figure');

  if (head) {
    snakeElement.classList.add('snake__figure--head');
  }
}

function removeSnakeClassToElement(elementId, head = false) {
  const snakeElement = document.getElementById(elementId);
  snakeElement.classList.remove('snake__figure--head');
  if (!head) {
    snakeElement.classList.remove('snake__figure');
  }
}

function generateSnake(position) {
  for (let i = 0; i <= gameSettings.startSnakeLenght; i++) {
    addSnakeClassToElement(position + i, i === 0);
    snakePosition = [...snakePosition, position + i];
  }
}

function generatePlayground(size) {
  const playgroundFullSize = size * size;
  gameSettings.playgroundFullSize = playgroundFullSize;
  let isLeftBorder;

  for (let i = 1; i <= playgroundFullSize; i++) {
    if (i <= size) {
      gameSettings.playgroundBorderPositionsTop = [
        ...gameSettings.playgroundBorderPositionsTop,
        i,
      ];
    }
    if (i > playgroundFullSize - size) {
      gameSettings.playgroundBorderPositionsDown = [
        ...gameSettings.playgroundBorderPositionsDown,
        i,
      ];
    }

    isLeftBorder = i % size;

    if (isLeftBorder === 0) {
      gameSettings.playgroundBorderPositionsRight = [
        ...gameSettings.playgroundBorderPositionsRight,
        i,
      ];
      if (i !== gameSettings.playgroundFullSize) {
        let nextIndex = i + 1;
        gameSettings.playgroundBorderPositionsLeft = [
          ...gameSettings.playgroundBorderPositionsLeft,
          nextIndex,
        ];
      }
    }

    playGround.insertAdjacentHTML(
      'beforeend',
      `<div id=${i} class="snake__box">`
    );
  }

  const defaultSnakePosition = playgroundFullSize / 2 - size / 2;

  generateSnake(defaultSnakePosition);
}

function changeHeadStyle() {
  switch (gameSettings.actualDirector) {
    case basicDirectors.left:
      styleDoc.setProperty('--headBorderRadius', '50% 0 0 50%');
      break;
    case basicDirectors.right:
      styleDoc.setProperty('--headBorderRadius', '0 50% 50% 0');
      break;
    case basicDirectors.top:
      styleDoc.setProperty('--headBorderRadius', '50% 50% 0 0');
      break;
    case basicDirectors.down:
      styleDoc.setProperty('--headBorderRadius', '0 0 50% 50% ');
      break;

    default:
      break;
  }
}

function moving() {
  gameSettings.actualDirector = gameSettings.newDirector;
  changeHeadStyle();
  let newPositionIds = [];

  snakePosition.forEach((positionId, key) => {
    const FIRST_ARRAY_ELEMENT = 0;

    let newFirstElementPosition = gameSettings.actualDirector + positionId;

    if (key === FIRST_ARRAY_ELEMENT) {
      switch (gameSettings.actualDirector) {
        case basicDirectors.top:
          {
            if (newFirstElementPosition < 0) {
              if (gameSettings.actualDifficult === basicDifficults.Easy) {
                newFirstElementPosition =
                  gameSettings.playgroundFullSize + newFirstElementPosition;

                break;
              }

              return endGame();
            }
          }
          break;

        case basicDirectors.right:
          {
            const searchPositionId = gameSettings.playgroundBorderPositionsRight.find(
              id => id === positionId
            );

            const searchNewPositionId = gameSettings.playgroundBorderPositionsLeft.find(
              id => id === newFirstElementPosition
            );

            if (
              searchPositionId &&
              searchNewPositionId |
                (newFirstElementPosition > gameSettings.playgroundFullSize)
            ) {
              if (gameSettings.actualDifficult === basicDifficults.Hard) {
                return endGame();
              }

              newFirstElementPosition =
                newFirstElementPosition - gameSettings.playgroundSize;
            }
          }
          break;

        case basicDirectors.down:
          {
            if (newFirstElementPosition > gameSettings.playgroundFullSize) {
              if (gameSettings.actualDifficult === basicDifficults.Easy) {
                newFirstElementPosition =
                  newFirstElementPosition - gameSettings.playgroundFullSize;

                break;
              }

              return endGame();
            }
          }
          break;

        case basicDirectors.left:
          {
            const searchPositionId = gameSettings.playgroundBorderPositionsLeft.find(
              id => id === positionId
            );

            const searchNewPositionId = gameSettings.playgroundBorderPositionsRight.find(
              id => id === newFirstElementPosition
            );

            if (
              (searchPositionId && searchNewPositionId) |
              !newFirstElementPosition
            ) {
              if (gameSettings.actualDifficult === basicDifficults.Hard) {
                return endGame();
              }
              newFirstElementPosition += gameSettings.playgroundSize;
            }
          }
          break;

        default:
          break;
      }

      const isCollision = snakePosition.findIndex(
        id => id === newFirstElementPosition
      );

      if (isCollision !== -1) {
        return endGame();
      }

      removeSnakeClassToElement(snakePosition[0], true);
      addSnakeClassToElement(newFirstElementPosition, true);

      newPositionIds = [...newPositionIds, newFirstElementPosition];
    }

    if (key === snakePosition.length - 1) {
      if (newPositionIds[0] === gameSettings.foodId) {
        removeFoodToPlayground();

        newPositionIds = [...newPositionIds, positionId];
      }

      removeSnakeClassToElement(positionId, false);
    }

    if (key !== 0) {
      newPositionIds = [...newPositionIds, snakePosition[key - 1]];
    }
  });

  snakePosition = newPositionIds;
}

const moveLeft = () => {
  if (
    !testNewDirectIsOppositeToActualDirector(basicDirectors.left) &&
    !testActualDirectIsHorizontal()
  ) {
    gameSettings.newDirector = basicDirectors.left;
  }
};

const moveRight = () => {
  if (
    !testNewDirectIsOppositeToActualDirector(basicDirectors.right) &&
    !testActualDirectIsHorizontal()
  ) {
    gameSettings.newDirector = basicDirectors.right;
  }
};

const moveTop = () => {
  if (
    !testNewDirectIsOppositeToActualDirector(basicDirectors.top) &&
    testActualDirectIsHorizontal()
  ) {
    gameSettings.newDirector = basicDirectors.top;
  }
};

const moveDown = () => {
  if (
    !testNewDirectIsOppositeToActualDirector(basicDirectors.down) &&
    testActualDirectIsHorizontal()
  ) {
    gameSettings.newDirector = basicDirectors.down;
  }
};

function detectKey(event) {
  const keyCode = {
    w: 87,
    s: 83,
    a: 65,
    d: 68,
    arrowTop: 38,
    arrowDown: 40,
    arrowRight: 39,
    arrowLeft: 37,
  };

  switch (event.keyCode) {
    case keyCode.arrowLeft:
    case keyCode.a:
      moveLeft();
      break;
    case keyCode.arrowTop:
    case keyCode.w:
      moveTop();
      break;
    case keyCode.arrowRight:
    case keyCode.d:
      moveRight();
      break;
    case keyCode.arrowDown:
    case keyCode.s:
      moveDown();
      break;
    default:
      break;
  }
}

document.addEventListener('touchstart', handleTouchStart, false);
document.addEventListener('touchmove', handleTouchMove, false);

var xDown = null;
var yDown = null;

function handleTouchStart(event) {
  xDown = event.changedTouches[0].clientX;
  yDown = event.changedTouches[0].clientY;
}

function handleTouchMove(event) {
  if (!xDown || !yDown) {
    return;
  }

  var xUp = event.changedTouches[0].clientX;
  var yUp = event.changedTouches[0].clientY;

  var xDiff = xDown - xUp;
  var yDiff = yDown - yUp;

  if (Math.abs(xDiff) > Math.abs(yDiff)) {
    if (xDiff > 0) {
      moveLeft();
    } else {
      moveRight();
    }
  } else {
    if (yDiff > 0) {
      moveTop();
    } else {
      moveDown();
    }
  }
  xDown = null;
  yDown = null;
}

function calcBoxSize() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  let PERCENT_OF_USED_WINDOW = 0.75;

  if (width <= 768) {
    PERCENT_OF_USED_WINDOW = 0.85;
  }

  const smallerValue = width > height ? height : width;

  let boxSize = Math.floor(
    (smallerValue * PERCENT_OF_USED_WINDOW) / gameSettings.playgroundSize
  );

  styleDoc.setProperty('--boxWidth', boxSize + 'px');
  styleDoc.setProperty('--boxHeight', boxSize + 'px');
}

window.addEventListener('resize', calcBoxSize);

function addFoodToPlayground(elementId) {
  const element = document.getElementById(elementId);

  element.insertAdjacentHTML('beforeend', `<div class="snake__food"></div>`);
}

const randomIdgenerator = () =>
  Math.floor(Math.random() * gameSettings.playgroundFullSize);

const generateFood = () => {
  let foodId;
  let isCorrectId;
  do {
    foodId = randomIdgenerator();
    isCorrectId = snakePosition.find(id => id === foodId);
  } while (isCorrectId);

  gameSettings.foodId = foodId;

  addFoodToPlayground(foodId);
};

const startBtn = document.querySelector('.settings__btn');

startBtn.addEventListener('click', startGame);
let autoMove = null;

const startAutoMove = () =>
  (autoMove = setInterval(() => moving(), gameSettings.gameSpeed));

function startGame() {
  snakePosition = [];
  gameSettings.gameSpeed = 400;
  settings.classList.add('settings--hidden');
  pointsViewDiv.classList.remove('points-view--hidden');

  playGround.innerHTML = '';
  gameSettings.actualDifficult = document.querySelector(
    'input[name=difficulty]:checked'
  ).value;
  const playgroundSize = document.querySelector(
    '.settings__playground-size-select'
  ).value;

  gameSettings.playgroundSize = parseInt(playgroundSize);

  basicDirectors = {
    ...basicDirectors,
    top: -playgroundSize,
    down: +playgroundSize,
  };

  calcBoxSize();
  styleDoc.setProperty('--rowNum', playgroundSize);
  styleDoc.setProperty('--colNum', playgroundSize);

  generatePlayground(playgroundSize);

  playGround.classList.remove('snake__playground--hidden');

  if (gameSettings.actualDifficult === basicDifficults.Medium) {
    playGround.classList.add('snake__playground--medium');
  }

  if (gameSettings.actualDifficult === basicDifficults.Hard) {
    playGround.classList.add('snake__playground--hard');
  }
  generateFood();
  document.addEventListener('keydown', detectKey);
  startAutoMove();
}

function removeFoodToPlayground() {
  const element = document.querySelector('.snake__food');
  element.remove();
  gameSettings.points += 10;
  pointsCounterView.innerHTML = gameSettings.points;
  generateFood();
  if (gameSettings.gameSpeed !== 100) {
    gameSettings.gameSpeed = gameSettings.gameSpeed - 25;
  }
  clearInterval(autoMove);
  startAutoMove();
}

function endGame() {
  alert('Game Over!\n Points: ' + gameSettings.points);
  playGround.classList.remove(
    'snake__playground--medium',
    'snake__playground--hard'
  );
  pointsViewDiv.classList.add('points-view--hidden');
  playGround.classList.add('snake__playground--hidden');
  clearInterval(autoMove);
  document.removeEventListener('keydown', detectKey);
  settings.classList.remove('settings--hidden');
  gameSettings.points = 0;
  pointsCounterView.innerHTML = gameSettings.points;
  actualDirector = defaultSetting.defaultDirector;
  newDirector = actualDirector;
}
