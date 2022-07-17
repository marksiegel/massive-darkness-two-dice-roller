(function() {

const SWORD = 'sword';
const SHIELD = 'shield';
const BAM = 'bam';
const DIAMOND = 'diamond';

const DIE_FACES = {
  'yellow': [
    [],
    [SWORD],
    [SWORD],
    [SWORD],
    [SWORD],
    [BAM, SWORD, SWORD],
  ],
  'red': [
    [],
    [SWORD],
    [SWORD],
    [BAM, SWORD, SWORD],
    [BAM, SWORD, SWORD],
    [DIAMOND, SWORD, SWORD, SWORD],
  ],
  'blue': [
    [],
    [SHIELD],
    [SHIELD],
    [SHIELD],
    [SHIELD],
    [BAM, SHIELD, SHIELD],
  ],
  'green': [
    [],
    [SHIELD],
    [SHIELD],
    [BAM, SHIELD, SHIELD],
    [BAM, SHIELD, SHIELD],
    [DIAMOND, SHIELD, SHIELD, SHIELD],
  ],
};

const ROLL_TYPES = ['even', 'odd'];

const store = {
  dice: []
}
const storeCallbacks = [];

function addStoreListener(cb) {
  storeCallbacks.push(cb);
}

function storeChanged() {
  for (const cb of storeCallbacks) {
    cb();
  }
}

function randomChoice(array) {
  return array[~~(Math.random() * array.length)];
}

function makeDie(dieColor) {
  const die = document.createElement('ol');
  die.classList = `die-list die-${dieColor} ${randomChoice(ROLL_TYPES)}-roll`;
  die.dataset.roll ='1';

  for (let index = 0; index < 6; index++) {
    const face = DIE_FACES[dieColor][index];
    const li = document.createElement('li');
    li.classList = 'die-item';
    li.dataset.side = `${index+1}`;
    li.onclick = function (e) { 
      die.classList.toggle("die-selected");
      storeChanged();
      e.stopPropagation();
    };

    for (const pip of face) {
      const span = document.createElement('span');
      span.classList = `pip pip-${pip}`;
      li.appendChild(span);
    }
    die.appendChild(li);
  }
  return die;
}

function addDie(dieColor) {
  const count = store.dice.filter(die => die.color === dieColor).length;
  if (count >= 3) { return; }
  const diceDiv = document.getElementById("dice");
  const die = makeDie(dieColor);
  diceDiv.appendChild(die);

  store.dice.push({
    color: dieColor,
    div: die,
  });
  storeChanged();
}
  
function findLastIndex(dice, dieColor) {
  for(let i=dice.length-1; i>=0; i--) {
    if (dice[i].color === dieColor) {
      return i;
    }
  }
  return -1;
}

function removeDie(dieColor) {
  const index = findLastIndex(store.dice, dieColor);
  if (index >= 0) {
    const removed = store.dice.splice(index, 1)[0];
    const diceDiv = document.getElementById("dice");
    diceDiv.removeChild(removed.div);
    storeChanged();
  }
}

function makeDiceControl(diceColor) {
  const div = document.createElement('div');
  div.classList = `dice-control dice-control-${diceColor}`;

  const label = document.createElement('span');
  label.classList = 'dice-control-label';
  function updateLabel () {
    label.innerText = `${store.dice.filter(die => die.color === diceColor).length}`;
  };
  updateLabel();
  addStoreListener(updateLabel);

  const minus = document.createElement('button');
  minus.classList = 'dice-control-minus';
  minus.onclick = function() { removeDie(diceColor); }

  const plus = document.createElement('button');
  plus.classList = 'dice-control-plus';
  plus.onclick = function() { addDie(diceColor); }

  div.appendChild(minus);
  div.appendChild(label);
  div.appendChild(plus);

  return div;  
}

function getResult() {
  const attack = { sword: 0, bam: 0, diamond: 0 };
  const defense = { shield: 0, bam: 0, diamond: 0 };
  for (const die of store.dice) {
    const roll = DIE_FACES[die.color][die.div.dataset.roll - 1];
    for (const pip of roll) {
      if (die.color === 'red' || die.color === 'yellow') {
        attack[pip]++;
      } else {
        defense[pip]++;
      }
    }
  }
  return {attack, defense};
}

function updateResult() {
  const {attack, defense} = getResult();
  document.getElementById("result-attack-sword-label").innerText = attack.sword;
  document.getElementById("result-attack-bam-label").innerText = attack.bam;
  document.getElementById("result-attack-diamond-label").innerText = attack.diamond;
  document.getElementById("result-defense-shield-label").innerText = defense.shield;
  document.getElementById("result-defense-bam-label").innerText = defense.bam;
  document.getElementById("result-defense-diamond-label").innerText = defense.diamond;
}

function rollDice(onlySelected = false) {
  document.getElementById("roll-button").disabled = true;
  document.getElementById("roll-selected-button").disabled = true;
  store.dice.forEach(die => {
    if (!onlySelected || die.div.classList.contains("die-selected")) {
      toggleClasses(die.div);
      die.div.dataset.roll = getRandomNumber(1, 6);
      die.div.classList.remove("die-selected");
    }
  });
  setTimeout(function () {
    document.getElementById("roll-button").disabled = false;
    updateResult();
  }, 1500);
}

function rollSelectedDice() {
  rollDice(true);
}

function toggleClasses(die) {
  die.classList.toggle("odd-roll");
  die.classList.toggle("even-roll");
}

function getRandomNumber(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

document.getElementById("roll-button").onclick = function () { rollDice(false); };
document.getElementById("roll-selected-button").onclick = function () { rollDice(true); }

const controlArea = document.getElementById("dice-control-area");
controlArea.appendChild(makeDiceControl("yellow"));
controlArea.appendChild(makeDiceControl("red"));
controlArea.appendChild(makeDiceControl("blue"));
controlArea.appendChild(makeDiceControl("green"));

function updateRerollButton () {
  const found = store.dice.filter(die => die.div.classList.contains("die-selected")).length;
  document.getElementById("roll-selected-button").disabled = !found;
}
updateRerollButton();
addStoreListener(updateRerollButton);

})();
