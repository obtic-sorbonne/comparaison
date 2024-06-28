


let text1_original;
let text2_original;

let text1Store;
let text2Store;

document.getElementById('submitButton').addEventListener('click', function() {

    // upadting HTML format with highlighting
    function highlight(data){

        text_1 = document.getElementById('text1');
        text_2 = document.getElementById('text2');

        text_1_html = data['text_1'];  
        text_2_html = data['text_2'];

        text_1.innerHTML = text_1_html;
        text_2.innerHTML = text_2_html;
        
    }

    // removing highlighting
    var text1_element = document.getElementById('text1');
    var text2_element = document.getElementById('text2');

    


    var text1Text = document.getElementById('text1').innerText;
    var text2Text = document.getElementById('text2').innerText;

    var text1HTML = document.getElementById('text1').innerHTML;
    var text2HTML = document.getElementById('text2').innerHTML;
     

    // for Loading appearance of button to wait for response
    var button = this;
    button.classList.add('loading');
    button.disabled = true;
    button.textContent = "Loading ...";

    // Getting selected checkbox value
    var containerLexical = document.getElementById("containerLexical");
    var containerEmbeddings = document.getElementById("containerEmbeddings");
    var containerEmbeddingsModel = document.getElementById("embeddingsModelContainer");
    var radiosLexical = containerLexical.querySelectorAll('input[name="methods_lexical"]');
    var radiosSemantic = containerEmbeddings.querySelectorAll('input[name="methods_embeddings"]');
    var radiosEmbeddings = containerEmbeddingsModel.querySelectorAll('input[name="embeddings_model"]');
    
    // slider value
    const valueDisplay = document.getElementById('sliderValue');

    
    var checkedValueLexical = null;
    var checkedValueSemantic= null;
    var checkedValueEmbedding = null;

    // we need to make sure all checkboxes are disabled in order to detect when both are selected for hybrid
    radiosLexical.forEach(function(radio) {
        if (radio.checked) {
            checkedValueLexical = radio.value;
        }
    });
    radiosSemantic.forEach(function(radio) {
        if (radio.checked) {
            checkedValueSemantic = radio.value;
        }
    });
    radiosEmbeddings.forEach(function(radio) {
        if (radio.checked) {
            checkedValueEmbedding = radio.value;
        }
    });

    var method = null;
    var submethods = [];
    if (checkedValueLexical !== null && checkedValueSemantic !== null) {
        method = "HYBRID"
        submethods.push(checkedValueLexical, checkedValueSemantic);
    } else if (checkedValueLexical !== null) {
        method = "LEXICAL";
        submethods.push(checkedValueLexical);
    } else if (checkedValueSemantic !== null) {
        method = "EMBEDDINGS";
        submethods.push(checkedValueSemantic)
    }

    var slidingValue = valueDisplay.textContent;   
    const sliderConfidence = document.getElementById('sliderConfidence').value;

    // variables used for Python code
    var data = {
        text1Text: text1Text,
        text2Text: text2Text,
        text1HTML: text1HTML,
        text2HTML: text2HTML,
        method: method,
        submethods: submethods,
        slidingValue: slidingValue,
        embedding: checkedValueEmbedding,
        sliderConfidence: sliderConfidence
    };

    // sending data for Python processing
    fetch('/process', {
        method: 'POST',
        body: JSON.stringify(data), // Send data as JSON
        headers: { 'Content-Type': 'application/json' }
    })     
    .then(response => response.json())
    .then(data => {

        // changes button appearance while loading
        button.classList.remove('loading');
        button.disabled = false;
        button.textContent = "Compare";
                
        highlight(data);
        
    })
    .catch(error => {
        console.error('Error calling Python:', error);
    });
});


document.addEventListener('DOMContentLoaded', function() {
    const methodSelector = document.getElementById('similarityMethod');
    const containerLexical = document.getElementById('containerLexical');
    const containerEmbeddings = document.getElementById('containerEmbeddings');
    const embeddingModelContainer = document.getElementById('embeddingsModelContainer');

    const sliderContainer = document.getElementById('sliderContainer');
    const slider = document.getElementById('slider');
    const valueDisplay = document.getElementById('sliderValue');

    var radiosLexical = containerLexical.querySelectorAll('input[name="methods_lexical"]');
    var radiosSemantic = containerEmbeddings.querySelectorAll('input[name="methods_embeddings"]');
    
    // function called when we choose the similarity method with select box
    methodSelector.addEventListener('change', function() {

        radiosLexical.forEach(function(radio) {
            radio.checked = false;
        });
        radiosSemantic.forEach(function(radio) {
            radio.checked = false;
        });
      const selectedOption = methodSelector.value;
    
      // changing displays based on selected method
      if (selectedOption === 'lexical') {
        containerLexical.style.display = 'block';
        containerEmbeddings.style.display = 'none';
        sliderContainer.style.display = 'none';
        embeddingModelContainer.style.display = 'none';
        document.getElementById('checkbox1_lexical').checked = true;
      } else if (selectedOption === 'embeddings') {
        containerLexical.style.display = 'none';
        containerEmbeddings.style.display = 'block';
        sliderContainer.style.display = 'none';
        embeddingModelContainer.style.display = 'block';
        document.getElementById('checkbox1_embeddings').checked = true;
      } else if (selectedOption === 'hybrid') {
   
        containerEmbeddings.style.display = 'block';
        containerLexical.style.display = 'block';
        sliderContainer.style.display = 'block';
        embeddingModelContainer.style.display = 'block';
        document.getElementById('checkbox1_lexical').checked = true;
        document.getElementById('checkbox1_embeddings').checked = true;

        const sliderValue = slider.value;
        valueDisplay.textContent = sliderValue;
    }

    });
    
    if (methodSelector.value === 'lexical') {
      containerLexical.style.display = 'block';
      containerEmbeddings.style.display = 'none';
    } else if (methodSelector.value === 'embeddings') {
      containerLexical.style.display = 'none';
      containerEmbeddings.style.display = 'block';
      embeddingModelContainer.display = 'block';
    } 

    // display value while using slider
    slider.addEventListener('input', function() {
        const sliderValue = slider.value;
        valueDisplay.textContent = sliderValue; // Display slider value somewhere, e.g., in a <span>
      });

      const sliderConfidence = document.getElementById('sliderConfidence');
      const sliderValueDisplay = document.getElementById('sliderValueConfidence');

      // display value while using slider confidencess
      sliderConfidence.addEventListener('input', function() {
        const sliderValue = sliderConfidence.value;
        sliderValueDisplay.textContent = sliderValue; // Display slider value somewhere, e.g., in a <span>
      });
  });



// Default value for textfields
document.addEventListener('DOMContentLoaded', function() {
    // Simulated default values fetched from another source
    let text_1 = `
    L'albatros majestueux planait au-dessus des vagues écumeuses, ses ailes étendues captant les courants d'air.
    Il parcourait des kilomètres sans effort, observant les poissons argentés scintiller sous la surface de l'océan.
    Le soleil couchant teintait le ciel de nuances d'orange et de rose, créant un tableau époustouflant.

    Le chat noir saute rapidement sur le toit.
    Il regarde autour de lui et aperçoit une souris grise qui court sur le sol.
    Le chat descend du toit avec agilité et commence à poursuivre la souris.
    La souris tente de s'échapper en se faufilant dans un trou, mais le chat est trop rapide pour elle.
    Finalement, le chat attrape la souris et retourne sur le toit pour savourer sa prise.
    `;
    let text_2 = `Le chat noir saute rapidement sur le toit.
    Il regarde autour de lui et voit une souris grise qui court sur le sol.
    Le chat descend du toit avec agilité et commence à poursuivre la souris.
    La souris tente de s'échapper en se faufilant dans un trou, mais le chat est trop rapide pour elle.
    Finalement, le chat attrape la souris et retourne sur le toit pour savourer sa proie.
    
    
    Le chercheur entra dans le laboratoire, ses mains protégées par des gants de latex.
    Devant lui, des tubes à essai alignés contenaient diverses solutions chimiques.
    Concentré, il ajusta le microscope pour observer les réactions au niveau cellulaire,
    cherchant des indices sur le développement des nouvelles molécules.
    `; 

    let text3 =  `Hugo aime bien manger des pâtes.
    sovent que denier a Change, Rimer vueil du monde divers. Toz fu estez, or est yvers;
    Bon fu, or est d'autre maniere, Quar nule gent n'est més maniere De l'autrui porfit porchacier,
    Se son preu n'i cuide chacier. Chascuns devient oisel de proie: Nul ne vit més se il ne proie.
    Por ce dirai l'estat du monde, Qui de toz biens se vuide et monde. Relegieus premierement Deussent vivre saintement,
     Ce croi, selonc m'entencion. Si a double religion: Li un sont moine blanc et noir Qui maint biau lieu et maint manoir
      Ont et mainte richece assise, Qui toz sont sers a Covoitise. Toz jors vuelent sanz doner prendre, Toz jors achatent
       sanz riens vendre. Il tolent, l'en ne lot tolt rien. Il sont fondé sus fort mesrien:
    `
    let text4 =  `
    Hugo aime bien des fois manger le riz.
    veux rimer sur ce monde changeant. L'été est passé, maintenant c'est l'hiver; le monde était bon, 
    maintenant c'est différent, car personne ne sait plus travailler au bien d'autrui,
    s'il ne pense pas y trouver son profit. Chacun se fait oiseau de proie: nul ne vit plus que de proies.
    C'est pourquoi je vais dire l'état où est ce monde, qui de tout bien se vide et s'émonde.
    Tout d'abord, les religieux devraient vivre saintement: c'est mon avis. 
    Or, ils sont de deux sortes: les uns sont des moines blancs ou noirs , qui possèdent maintes
    belles résidences et maintes richesses solides. Ils sont tous esclaves de Cupidité.
    Sans cesse ils veulent prendre sans jamais donner, sans cesse ils achètent sans jamais rien vendre.
    Ils prennent, et on ne leur prend
    `


    // Set default values to the textareas
    
    document.getElementById('text1').innerText = text3;
    document.getElementById('text2').innerText = text4;
    
    document.getElementById('checkbox1_lexical').checked = true;

    document.getElementById('embeddingsModelContainer1').checked = true;


    text1_original = document.getElementById('text1').innerHTML;
    text2_original = document.getElementById('text2').innerHTML;

    button_exact_diff = document.getElementById('exact-diff-button');
    button_reverse = document.getElementById('reverse-button');

    // function for entity search.
    const search_entity = document.getElementById('search_entity');
    search_entity.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {

            text1_last = document.getElementById('text1').innerHTML;
            text2_last = document.getElementById('text2').innerHTML;

            filterEntity();
            show_buttons_filter(button_exact_diff, button_reverse);

            button_reverse.addEventListener('click', function(event) {
                document.getElementById('text1').innerHTML = text1_last;
                document.getElementById('text2').innerHTML = text2_last;
                button_exact_diff.style.display = 'none';
                button_reverse.style.display = 'none';
            });
        }
    });

    button_exact_diff.addEventListener('click', function(event) {
        text_1 = document.getElementById('text1');
        text_2 = document.getElementById('text2');

        function difflibFunc(text1, text2) {
            let diffResult = diff.diffWords(text1.split(/\s+/), text2.split(/\s+/));
            
            let result1 = '';
            let result2 = '';
            
            diffResult.forEach(part => {
                // Green for additions, red for deletions, and grey for common parts
                const color = part.added ? 'green' :
                              part.removed ? 'red' : 'grey';
                
                const text = part.value.trim();
                
                if (part.removed) {
                    result1 += `<span style="color: red">${text}</span> `;
                } else if (part.added) {
                    result2 += `<span style="color: green">${text}</span> `;
                } else {
                    result1 += `${text} `;
                    result2 += `${text} `;
                }
            });
        
            // Assuming text1 and text2 are HTML elements or IDs of text areas
            document.getElementById('text1').innerHTML = result1;
            document.getElementById('text2').innerHTML = result2;
        }

        difflibFunc(text_1.innerText, text_2.innerText);
        
    });


    
    function show_buttons_filter() {

        button_exact_diff.style.display = 'block';
        button_reverse.style.display = 'block';
    }

    // Function to perform search
    function filterEntity() {
        text_1 = document.getElementById('text1');
        text_2 = document.getElementById('text2');

        const searchTerm = search_entity.value.trim(); // Get the search term and trim any extra whitespace

        // Original content of text1 and text2
        let originalText1 = text_1.textContent;
        let originalText2 = text_2.textContent;

        // Split original content into sentences
        let sentences1 = originalText1.split('.');
        let sentences2 = originalText2.split('.');

        // Filter sentences containing the search term
        let filteredSentences1 = sentences1.filter(sentence => sentence.toLowerCase().includes(searchTerm.toLowerCase()));
        let filteredSentences2 = sentences2.filter(sentence => sentence.toLowerCase().includes(searchTerm.toLowerCase()));

        // Join filtered sentences back into text
        let filteredText1 = filteredSentences1.join('.');
        let filteredText2 = filteredSentences2.join('.');

        // Update text content with filtered results
        text_1.textContent = filteredText1;
        text_2.textContent = filteredText2;
    }

    // Function to handle paste events for textfields
    function handlePaste(e) {
        e.preventDefault(); // Prevent default paste behavior
        
        // Get pasted data as plain text
        var text = e.clipboardData.getData('text/plain');
        
        // Insert text manually with default font
        document.execCommand('insertText', false, text);
    }
      
    const textArea1 = document.getElementById('text1');
    textArea1.addEventListener('paste', handlePaste);
    const textArea2 = document.getElementById('text2');
    textArea2.addEventListener('paste', handlePaste);

    
});






