(function () {
  const SWORD = "sword";
  const SHIELD = "shield";
  const BAM = "bam";
  const SHADOW = "shadow";
  const CLAW = "claw";
  const SCRATCH = "scratch";

  const DIE_FACES = {
    yellow: [
      [],
      [SWORD],
      [BAM, SWORD],
      [BAM, SWORD],
      [SWORD, SWORD],
      [SWORD, SWORD, SWORD],
    ],
    orange: [
      [],
      [SWORD],
      [BAM, SWORD],
      [SWORD, SWORD],
      [BAM, SWORD, SWORD],
      [SWORD, SWORD, SWORD],
    ],
    blue: [[], [], [SHIELD], [SHIELD], [SHIELD, SHIELD], [SHIELD, SHIELD]],
    purple: [
      [SHADOW],
      [SWORD],
      [SWORD, SWORD],
      [BAM],
      [BAM, BAM],
      [SWORD, SWORD, SWORD],
    ],
    black: [[], [], [SCRATCH], [SCRATCH], [CLAW], [CLAW, SCRATCH]],
  };

  const ROLL_TYPES = ["even", "odd"];

  const store = {
    dice: [],
  };
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
    const die = document.createElement("ol");
    die.classList = `die-list die-${dieColor} ${randomChoice(ROLL_TYPES)}-roll`;
    die.dataset.roll = "1";

    for (let index = 0; index < 6; index++) {
      const face = DIE_FACES[dieColor][index];
      const li = document.createElement("li");
      li.classList = "die-item";
      li.dataset.side = `${index + 1}`;
      li.onclick = function (e) {
        die.classList.toggle("die-selected");
        storeChanged();
        e.stopPropagation();
      };

      for (const pip of face) {
        const span = document.createElement("span");
        span.classList = `pip pip-${pip}`;
        li.appendChild(span);
      }
      die.appendChild(li);
    }
    return die;
  }

  function addDie(dieColor) {
    const count = store.dice.filter((die) => die.color === dieColor).length;
    if (count >= 6) {
      return;
    }
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
    for (let i = dice.length - 1; i >= 0; i--) {
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
    const div = document.createElement("div");
    div.classList = `dice-control dice-control-${diceColor}`;

    const label = document.createElement("span");
    label.classList = "dice-control-label";
    function updateLabel() {
      label.innerText = `${
        store.dice.filter((die) => die.color === diceColor).length
      }`;
    }
    updateLabel();
    addStoreListener(updateLabel);

    const minus = document.createElement("button");
    minus.classList = "dice-control-minus";
    minus.onclick = function () {
      removeDie(diceColor);
    };

    const plus = document.createElement("button");
    plus.classList = "dice-control-plus";
    plus.onclick = function () {
      addDie(diceColor);
    };

    div.appendChild(minus);
    div.appendChild(label);
    div.appendChild(plus);

    return div;
  }

  function getResult() {
    const result = {
      sword: 0,
      bam: 0,
      shadow: 0,
      shield: 0,
      claw: 0,
      scratch: 0,
    };
    for (const die of store.dice) {
      const roll = DIE_FACES[die.color][die.div.dataset.roll - 1];
      for (const pip of roll) {
        result[pip]++;
      }
    }
    return result;
  }

  function updateResult() {
    const result = getResult();
    document.getElementById("result-attack-sword-label").innerText =
      result.sword;
    document.getElementById("result-attack-bam-label").innerText = result.bam;
    document.getElementById("result-attack-shadow-label").innerText =
      result.shadow;
    document.getElementById("result-defense-shield-label").innerText =
      result.shield;
    document.getElementById("result-defense-claw-label").innerText =
      result.claw;
    document.getElementById("result-defense-scratch-label").innerText =
      result.scratch;
  }

  function rollDice(onlySelected = false) {
    document.getElementById("roll-button").disabled = true;
    document.getElementById("roll-selected-button").disabled = true;
    store.dice.forEach((die) => {
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

  function toggleClasses(die) {
    die.classList.toggle("odd-roll");
    die.classList.toggle("even-roll");
  }

  function getRandomNumber(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  document.getElementById("roll-button").onclick = function () {
    rollDice(false);
  };
  document.getElementById("roll-selected-button").onclick = function () {
    rollDice(true);
  };

  const controlArea = document.getElementById("dice-control-area");
  controlArea.appendChild(makeDiceControl("yellow"));
  controlArea.appendChild(makeDiceControl("orange"));
  controlArea.appendChild(makeDiceControl("blue"));
  controlArea.appendChild(makeDiceControl("purple"));
  controlArea.appendChild(makeDiceControl("black"));

  function updateRerollButton() {
    const found = store.dice.filter((die) =>
      die.div.classList.contains("die-selected")
    ).length;
    document.getElementById("roll-selected-button").disabled = !found;
  }
  updateRerollButton();
  addStoreListener(updateRerollButton);
})();
