////////////////////////////////////////////////////////////////////////
//                           Creations                                //
//                                                                    //  
////////////////////////////////////////////////////////////////////////

import { sentences } from "./objects.js";


/**************************************************************************************/

const randomNumber = Math.random();

let correctKey;
let incorrectKey;

if (randomNumber < 0.5) {
  correctKey = "a";
  incorrectKey = "l";
} else {
  correctKey = "l";
  incorrectKey = "a";
}

/**************************************************************************************/

const OBJECTS_URL =
  "https://raw.githubusercontent.com/saramff/objects-attributes-images/refs/heads/master";
const TOTAL_IMAGES = 192;  

// Create pictures arrays for objects images
const objectsImages = Array.from(
  { length: TOTAL_IMAGES },
  (_, i) => `${OBJECTS_URL}/object-${i + 1}.jpg`
);

/**************************************************************************************/

const FALSE_OBJECTS_URL =
  "https://raw.githubusercontent.com/saramff/objects-attributes-images/refs/heads/master/object-attributes-images_NonExperimental";
const TOTAL_OJECTS_IMAGES = 48;  

const trueObjectsExperimental = objectsImages.slice(0, TOTAL_OJECTS_IMAGES);

const trueObjectsExperimentalWithResponse = trueObjectsExperimental.map((objImg) => {
  return {
    img: objImg,
    correct_response: correctKey
  }
})

// Create pictures arrays for objects images
const falseObjectsExperimental = Array.from(
  { length: TOTAL_OJECTS_IMAGES },
  (_, i) => `${FALSE_OBJECTS_URL}/object-${i + 1}.jpg`
);

const falseObjectsExperimentalWithResponse = falseObjectsExperimental.map((objImg) => {
  return {
    img: objImg,
    correct_response: incorrectKey
  }
})

const objectsExperimental = [...trueObjectsExperimentalWithResponse, ...falseObjectsExperimentalWithResponse];

/**************************************************************************************/

// Create suffle function - suffles array index randomly
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

shuffle(objectsImages);
shuffle(objectsExperimental);

/**************************************************************************************/

const TOTAL_SENTENCES = 48;

// Create function to get a new array with a random slice from other array
function getRandomSlice(array, sliceSize) {
  const arraySlice = [];

  for (let i = 0; i < sliceSize; i++) {
    const randomIndex = Math.floor(Math.random() * array.length);
    const randomElem = array.splice(randomIndex, 1)[0];
    arraySlice.push(randomElem);
  }

  return arraySlice;
}

shuffle(sentences);
const sentencesSlice = getRandomSlice(sentences, TOTAL_SENTENCES);

// New Array with first half with TRUE sentences and second half with FALSE sentences
const sentencesWithResponse = sentencesSlice.map((sentence, index) => {
  return {
    sentence: index < TOTAL_SENTENCES / 2 ? sentence.true : sentence.false,
    correct_response: index < TOTAL_SENTENCES / 2 ? correctKey : incorrectKey
  }
})

// Shuffle sentences with response
shuffle(sentencesWithResponse);


/**************************************************************************************/

/* Initialize jsPsych */
let jsPsych = initJsPsych();

/* Create timeline */
let timeline = [];

////////////////////////////////////////////////////////////////////////
//                           Consent                                  //
//                           (!works only on server)                  //  
////////////////////////////////////////////////////////////////////////

let check_consent = (elem) => {
  if (document.getElementById('consent_checkbox').checked) {
    return true;
  }
  else {
    alert("Muchas gracias por su interés en nuestro experimento. Si está listo para participar, por favor, dénos su consentimiento.");
    return false;
  }
  return false;
};

let html_block_consent = {
  type: jsPsychExternalHtml,
  url: "consentA2.html",
  cont_btn: "start_experiment",
  check_fn: check_consent
};
timeline.push(html_block_consent);

// // ////////////////////////////////////////////////////////////////////////
// // //                           Demographic  variables                   //
// // ////////////////////////////////////////////////////////////////////////

/* fullscreen */
timeline.push({
  type: jsPsychFullscreen,
  fullscreen_mode: true,
  message: '<p>Por favor, haga clic para cambiar al modo de pantalla completa.</p>',
  button_label:'Weiter',
  on_finish: function(data){
    var help_fullscreen = data.success;
    jsPsych.data.addProperties({fullscreen: help_fullscreen});
  }
});

var age = {
  type: jsPsychSurveyText,
  preamble: 'A continuación, le preguntaremos algunos datos demográficos.',
  name: 'age',
    button_label:'Weiter',
    questions: [{prompt:'<div>¿Cuántos años tiene?<\div>', rows: 1, columns: 2, required: 'true'}],
  data: {
    type:"demo",
    age: age,
  },
  on_finish: function(data){
    var help_age = data.response.Q0;
    jsPsych.data.addProperties({age: help_age});
  },
  on_load: function() {
    document.querySelector('.jspsych-btn').style.marginTop = '20px'; // Adjust margin as needed
  }
};

//jsPsych.data.get().last(1).values()[0].response.Q0

timeline.push(age);

var demo2 = {
  type: jsPsychSurveyMultiChoice,
  questions: [
    {
      prompt:'Por favor, seleccione el género con el que se identifica.',
      name: 'gender',
      options: ["masculino", "femenino", "otro", "prefiero no decirlo"],
      required: true,
      horizontal: true
    },
     {
      prompt:'Por favor, seleccione su lengua materna.',
      name: 'language',
      options: ["español", "otro"],
      required: true,
      horizontal: true
    },
  ],
  button_label:'Weiter',
  on_finish: function(data) {
    var help_gender = data.response.gender;
    var help_language = data.response.language;
    jsPsych.data.addProperties({gender: help_gender, language: help_language});
  }
};
timeline.push(demo2);

/************************************************************************************************ */

/* Preload images */
let preload = {
  type: jsPsychPreload,
  images: objectsImages,
};
timeline.push(preload);

let preload2 = {
  type: jsPsychPreload,
  images: falseObjectsExperimental,
};
timeline.push(preload2);


/* Fixation trial */
let fixation = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: '<div style="font-size:60px;">+</div>',
  choices: "NO_KEYS", // Prevent key press
  trial_duration: 500, // Fixation duration
  data: {
    task: "fixation",
  },
};

/* Welcome message trial */
let welcome = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: "Bienvenido al experimento. Pulse cualquier tecla para comenzar.",
};
timeline.push(welcome);


// /**************************************************************************************/

/* Instructions trial */
let instructions = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <p>Bienvenido al experimento. Presione cualquier tecla para comenzar.</p>
    <p>Por favor, preste mucha atención a cada objeto y a su aspecto.</p>
    <p>Los objetos aparecerán solos. Usted no tiene que hacer nada más que observar con atención.</p>
    <p>Cuando esté preparado, pulse cualquier tecla para empezar.</p>
  `,
  post_trial_gap: 500,
};
timeline.push(instructions);

/* Create stimuli array for image presentation */
let test_stimuli = objectsImages.map((objectImg) => {
  return {
    stimulus: `
      <img class="object-img" src="${objectImg}">
    `,
  };
});

/* Image presentation trial */
let test = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: jsPsych.timelineVariable("stimulus"),
  choices: "NO_KEYS", // Prevent key press
  trial_duration: 2000, // Display each image for 2 second
  post_trial_gap: 500
};

/* Test procedure: fixation + image presentation */
let test_procedure = {
  timeline: [fixation, test],
  timeline_variables: test_stimuli,
  randomize_order: true, // Randomize image order
};
timeline.push(test_procedure);


/**************************************************************************************/

/* Instructions for sentence presentation */
let instructionsSentencePresentation = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <p>Ahora verá una serie de frases en la pantalla.</p>
    </p>Cada frase describe una característica de los objetos que ha visto anteriormente.</p>
    </p></p>
    <p>Si la frase es verdadera, pulse la tecla '${correctKey.toUpperCase()}' (sí).</p>
    <p>Si la frase es falsa, pulse la tecla '${incorrectKey.toUpperCase()}' (no).</p>
    </p></p>
    </p>Por ejemplo: si anteriormente ha visto la imagen de una caja abierta y luego aparece la frase: "La caja estaba cerrada", deberá pulsar "NO".</p>
    <br />
    <div>
      <img src='https://raw.githubusercontent.com/saramff/objects-attributes-images/refs/heads/master/Caja.jpg'  class="img-instructions" />
    </div>
    <br />
    <p>Pulse cualquier tecla para comenzar.<p>
  `,
  post_trial_gap: 500,
};
timeline.push(instructionsSentencePresentation);

/* Create stimuli array for sentence presentation */
let sentenceRecognitionStimuli = sentencesWithResponse.map((sentence) => {
  return {
    stimulus: `
      <h3 class="sentence">${sentence.sentence}</h3>
      <div class="keys">
        <p class="${correctKey === 'a' ? 'left' : 'right'}">SÍ</p>
        <p class="${correctKey === 'a' ? 'right' : 'left'}">NO</p>
      </div>
    `,
    correct_response: sentence.correct_response
  };
});

/* Sentences presentation trial */
let testSentences = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: jsPsych.timelineVariable("stimulus"),
  choices: ['a', 'l'],
  data: {
    task: "response sentences test",
    correct_response: jsPsych.timelineVariable("correct_response"),
  },
  on_finish: function (data) {
    data.correct = jsPsych.pluginAPI.compareKeys(
      data.response,
      data.correct_response
    );
    data.correct_response_meaning = correctKey === data.correct_response ? "YES" : "NO";
  },
};

/* Test procedure: fixation + sentences presentation */
let testSentencesProcedure = {
  timeline: [fixation, testSentences],
  timeline_variables: sentenceRecognitionStimuli,
  randomize_order: true, // Randomize sentences order
};
timeline.push(testSentencesProcedure);


/**************************************************************************************/


/* Instructions for Tetris */
let instructionstetris = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <p>Ahora jugará Tetris durante aproximadamente 20 minutos.</p>
    <p>Utilice las teclas de las flechas en el teclado para mover las piezas.</p>
    </p></p>
    <p>Presione la barra espaciadora para comenzar. Cuando aparezca la pantalla del juego, haga clic en "Play" para iniciar el juego.</p>
    <p>Si pierde, seleccione "Try again" para reiniciar el juego. Jugará de esta manera hasta que el tiempo se agote.</p>
    <p>Presione cualquier tecla para comenzar.<p>
  `,
  post_trial_gap: 500,
};
timeline.push(instructionstetris);

/* Tetris */
let tetris = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <div class="tetris-visible"></div>
  `,
  post_trial_gap: 500,
  choices: "NO_KEYS", // Prevent key press
  trial_duration: 200, 
};
timeline.push(tetris);


/**************************************************************************************/


/* Instructions for objects experimental images presentation */
let instructionsObjectsNamePresentation = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <p>Presione cualquier tecla para comenzar.</p>
    <p>Si ha visto antes el objeto, pulse la tecla '${correctKey.toUpperCase()}' (sí).</p>
    <p>Si no ha visto antes el objeto, pulse la tecla '${incorrectKey.toUpperCase()}' (no).</p>
    <p>Pulse cualquier tecla para comenzar.</p>
  `,
  post_trial_gap: 500,
};
timeline.push(instructionsObjectsNamePresentation);

/* Create stimuli array for objects experimental images presentation */
let objectsExperimentalRecognitionStimuli = objectsExperimental.map((objExperimental) => {
  return {
    stimulus: `
      <img class="object-img" src="${objExperimental.img}">
      <div class="keys">
        <p class="${correctKey === 'a' ? 'left' : 'right'}">SÍ</p>
        <p class="${correctKey === 'a' ? 'right' : 'left'}">NO</p>
      </div>
    `,
    correct_response: objExperimental.correct_response
  };
});

/* Objects experimental images presentation trial */
let testObjectsExperimentalImg = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: jsPsych.timelineVariable("stimulus"),
  choices: ['a', 'l'],
  data: {
    task: "response objects experimental images test",
    correct_response: jsPsych.timelineVariable("correct_response"),
  },
  on_finish: function (data) {
    data.correct = jsPsych.pluginAPI.compareKeys(
      data.response,
      data.correct_response
    );
    data.correct_response_meaning = correctKey === data.correct_response ? "YES" : "NO";
  },
};

/* Test procedure: fixation + objects experimental images presentation */
let testObjectsExperimentalImgProcedure = {
  timeline: [fixation, testObjectsExperimentalImg],
  timeline_variables: objectsExperimentalRecognitionStimuli,
  randomize_order: true, // Randomize objects name order
};
timeline.push(testObjectsExperimentalImgProcedure);


// /**************************************************************************************/


// Generate a random subject ID with 15 characters
var subject_id = jsPsych.randomization.randomID(15);
jsPsych.data.addProperties({
  subject: subject_id,
});


// function saveData(name, data){
//   console.log("Función saveData llamada");
//   console.log("Guardando datos:", name, data);

//   var xhr = new XMLHttpRequest();
//   xhr.open('POST', 'write_data.php'); 
//   xhr.setRequestHeader('Content-Type', 'application/json');
//   xhr.send(JSON.stringify({filename: name, filedata: data}));

//   console.log("Datos enviados");
// };

// var save_data_block = {
//   type: jsPsychCallFunction,
//   func: function(){saveData("data/Subject_"+ subject_id, jsPsych.data.get().csv());},
//   timing_post_trial: 200
// };

function saveData(data) {
  console.log(data);
  
  
}

const saveDataBlock = {
  type: jsPsychCallFunction,
  func: function() {
    saveData(jsPsych.data.get())
  },
  timing_post_trial: 200
}

timeline.push(saveDataBlock);


/* Run the experiment */
jsPsych.run(timeline);

// Uncomment to see the results on the console (for debugging)
// console.log(jsPsych.data.get());