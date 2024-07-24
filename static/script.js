


let text1_original;
let text2_original;

let text1Store;
let text2Store;

let text1DiffStore;
let text2DiffStore;

let pairedSentences1;
let pairedSentences2;
let pairedIndex = 0;

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

    var similarityMethod2 = document.getElementById('similarityMethod2');
    var precisionLabel = similarityMethod2.value;

    var textProcess = document.getElementById('text-processing-select');
    var ngramsInput = document.getElementById('ngrams-input');

    var nb_sentences_value = document.getElementById('nb_sentences').value;


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
        sliderConfidence: sliderConfidence,
        precisionLabel: precisionLabel,
        textProcess: textProcess.value,
        ngramsInput: ngramsInput.value,
        nb_sentences_value : nb_sentences_value
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


        // dealing with cursor sentences
        sent_list_1 = data['sent_list_1'];
        sent_list_2 = data['sent_list_2'];

        pairedSentences1 = sent_list_1;
        pairedSentences2 = sent_list_2;


        findNextButton = document.getElementById('findNextButton');
        findNextButton.addEventListener('click', function() {
        
            text1 = document.getElementById('text1');
            text2 = document.getElementById('text2');
            
            function scrollToSubstring(textid, substring) {
                textField = document.getElementById(textid);
                innerText = textField.innerText.replace(/\n/g, '\\n');
                
                var index = innerText.indexOf(substring);
                if (index !== -1) {
                    textField.scrollTop = textField.scrollHeight * (index / innerText.length) - 200;
                }
            }
            
            scrollToSubstring("text1", pairedSentences1[pairedIndex]);
            scrollToSubstring("text2", pairedSentences2[pairedIndex]);
            
            pairedIndex = pairedIndex + 1;
            if (pairedIndex === pairedSentences1.length){
                pairedIndex = 0;
            }
        });

        function simulateClick(button) {
            const event = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window
            });

            button.dispatchEvent(event);
        }
        simulateClick(findNextButton);
        
    })
    .catch(error => {
        console.error('Error calling Python:', error);
    });

    localStorage.setItem('savedText1', text1.innerText);
    localStorage.setItem('savedText2', text2.innerText);

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
    var sliderValueConfidence = document.getElementById('sliderValueConfidence');


    var precisionSelector = document.getElementById('similarityMethod2');
    var slider_precision = document.getElementById('slider_precision');
    
    precisionSelector.addEventListener('change', function() {
        if (precisionSelector.value === 'selection_quantile'){
            slider_precision.textContent = 'Top% Quantile';
            number_sentences.style.display = 'none';
            sliderConfidence.style.display = 'block';
            sliderValueConfidence.style.display = 'block';
        } else if (precisionSelector.value === 'selection_sim_score'){
            slider_precision.textContent = 'Similarity score';
            sliderConfidence.style.display = 'block';
            number_sentences.style.display = 'none';
            sliderValueConfidence.style.display = 'block';
        } else if (precisionSelector.value === 'selection_sentences') {
            slider_precision.textContent = 'Number of sentences/chunks';
            sliderConfidence.style.display = 'none';
            
            number_sentences = document.getElementById('nb_sentences');
            number_sentences.style.display = 'block';
            sliderConfidence.style.display = 'none';
            sliderValueConfidence.style.display = 'none';
        }
    });
    
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
      
      sliderValueDisplay.textContent = 0.7;

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

    let text3 =  `Dans un effort pour améliorer l'expérience utilisateur globale, Hugo a décidé de mettre en œuvre plusieurs nouvelles fonctionnalités, y compris un tableau de bord personnalisable, des notifications en temps réel et des mesures de sécurité renforcées.
    sovent que denier a Change, Rimer vueil du monde divers. Toz fu estez, or est yvers;
    Bon fu, or est d'autre maniere, Quar nule gent n'est més maniere De l'autrui porfit porchacier,
    Se son preu n'i cuide chacier. Chascuns devient oisel de proie: Nul ne vit més se il ne proie.
    Por ce dirai l'estat du monde, Qui de toz biens se vuide et monde. Relegieus premierement Deussent vivre saintement,
     Ce croi, selonc m'entencion. Si a double religion: Li un sont moine blanc et noir Qui maint biau lieu et maint manoir
      Ont et mainte richece assise, Qui toz sont sers a Covoitise. Toz jors vuelent sanz doner prendre, Toz jors achatent
       sanz riens vendre. Il tolent, l'en ne lot tolt rien. Il sont fondé sus fort mesrien.
       Hugo aime les animaux.
    `;
    let text4 =  `Dans une tentative d'améliorer l'expérience utilisateur globale, Hugo a choisi d'introduire plusieurs nouvelles fonctionnalités, telles qu'un tableau de bord personnalisable, des notifications instantanées et des protocoles de sécurité améliorés.
    veux rimer sur ce monde changeant. L'été est passé, maintenant c'est l'hiver; le monde était bon, 
    maintenant c'est différent, car personne ne sait plus travailler au bien d'autrui,
    s'il ne pense pas y trouver son profit. Chacun se fait oiseau de proie: nul ne vit plus que de proies.
    C'est pourquoi je vais dire l'état où est ce monde, qui de tout bien se vide et s'émonde.
    Tout d'abord, les religieux devraient vivre saintement: c'est mon avis. 
    Or, ils sont de deux sortes: les uns sont des moines blancs ou noirs , qui possèdent maintes
    belles résidences et maintes richesses solides. Ils sont tous esclaves de Cupidité.
    Sans cesse ils veulent prendre sans jamais donner, sans cesse ils achètent sans jamais rien vendre.
    Ils prennent, et on ne leur prend.
    Hugo aime les animaux.
    `;

    // Set default values to the textareas
    

    let text1 = document.getElementById('text1');
    let text2 = document.getElementById('text2');

    document.getElementById('text1').innerText = text3;
    document.getElementById('text2').innerText = text4;

    
    if (localStorage.getItem('savedText1')) {
        text1.innerText = localStorage.getItem('savedText1');
    }
    if (localStorage.getItem('savedText2')) {
        text2.innerText = localStorage.getItem('savedText2');
    }
    
    document.getElementById('checkbox1_lexical').checked = true;
    document.getElementById('embeddingsModelContainer1').checked = true;


    text1_original = document.getElementById('text1').innerHTML;
    text2_original = document.getElementById('text2').innerHTML;

    button_exact_diff = document.getElementById('exact-diff-button');
    button_reverse = document.getElementById('reverse-button');

    button_guide = document.getElementById('guideButton');

    importButton1 = document.getElementById('importButton1');
    importButton2 = document.getElementById('importButton2');

    var ngramsContainer = document.getElementById('ngrams-container');
    ngramsContainer.style.display = 'block';


    document.getElementById('text-processing-select').addEventListener('change', function() {
        var selectedValue = this.value;
        var ngramsContainer = document.getElementById('ngrams-container');

        if (selectedValue === 'NGRAMS') {
            ngramsContainer.style.display = 'block';
        } else {
            ngramsContainer.style.display = 'none';
        }
    });

    importButton1.addEventListener('click', function() {
        
        const fileInput = document.createElement('input');
        fileInput.setAttribute('type', 'file');
        fileInput.setAttribute('accept', ['.pdf', '.txt']); // Only accept PDF files
        fileInput.classList.add('fileInput');
        
        fileInput.addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (file) {
                var filename = file.name;
                var fileExtension = filename.split('.').pop().toLowerCase();

                if (fileExtension === 'txt') {

                    var reader = new FileReader();

                    reader.onload = function(event) {
                        var contents = event.target.result;
                        text1.textContent = contents;
                    };
                    reader.readAsText(file);
                    localStorage.setItem('savedText1', text1.textContent);


                } else if (fileExtension === 'pdf') {

                    const formData = new FormData();
                    formData.append('pdfFile', file);

                    // sending data for Python processing
                    fetch('/extract_pdf_text', {
                        method: 'POST',
                        body: formData,
                    })     
                    .then(response => response.json())
                    .then(data => {

                        text = data['pdfText'];
                        text = text.replace(/\n/g, ' ');
                        text1.innerText = text;
                        localStorage.setItem('savedText1', text1.innerText);
                        
                    })
                    .catch(error => {
                        console.error('Error calling Python:', error);
                    });
                    
                }
            }
        });

        // Trigger the file input dialog
        fileInput.click();

});

importButton2.addEventListener('click', function() {
    const fileInput = document.createElement('input');
    fileInput.setAttribute('type', 'file');
    fileInput.setAttribute('accept', ['.pdf', '.txt']); // Only accept PDF files
    fileInput.classList.add('fileInput');


    fileInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            var filename = file.name;
            var fileExtension = filename.split('.').pop().toLowerCase();

            if (fileExtension === 'txt') {

                var reader = new FileReader();

                reader.onload = function(event) {
                    var contents = event.target.result;
                    text2.textContent = contents;
                };
                reader.readAsText(file);
                localStorage.setItem('savedText2', text2.textContent);


            } else if (fileExtension === 'pdf') {

                const formData = new FormData();
                formData.append('pdfFile', file);

                // sending data for Python processing
                fetch('/extract_pdf_text', {
                    method: 'POST',
                    body: formData,
                })     
                .then(response => response.json())
                .then(data => {

                    text = data['pdfText'];
                    text = text.replace(/\n/g, ' ');
                    text2.innerText = text;
                    localStorage.setItem('savedText2', text2.innerText);
                    
                })
                .catch(error => {
                    console.error('Error calling Python:', error);
                });
            }
        }
    });

    // Trigger the file input dialog
    fileInput.click();
    });


    // Close the popup when clicking outside of it
    document.getElementById('overlay').addEventListener('click', function(event) {
        if (event.target === this) { // Clicked on the overlay itself, not on the popup
            document.getElementById('overlay').style.display = 'none';
            document.getElementById('popup').style.display = 'none';
        }
    });

    // closing button for guide
    document.getElementById('popupCloseBtn').addEventListener('click', function(event) {
        document.getElementById('overlay').style.display = 'none';
        document.getElementById('popup').style.display = 'none';
    });

    // guide button
    button_guide.addEventListener('click', function(event) {
        document.getElementById('overlay').style.display = 'block';
        document.getElementById('popup').style.display = 'block';
    })
    
    // function for entity search.
    const search_entity = document.getElementById('search_entity');
    search_entity.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            text1_last = document.getElementById('text1').innerHTML;
            text2_last = document.getElementById('text2').innerHTML;

            filterEntity();
           
            show_buttons_filter(button_exact_diff, button_reverse);

            // button to go back before filtering
            button_reverse.addEventListener('click', function(event) {
                document.getElementById('text1').innerHTML = text1_last;
                document.getElementById('text2').innerHTML = text2_last;
                button_exact_diff.style.display = 'none';
                button_reverse.style.display = 'none';
            });
        }
        });

        // button to show exact differences for entities search
        button_exact_diff.addEventListener('click', function(event) {

            const text_1 = document.getElementById('text1');
            const text_2 = document.getElementById('text2');

            const oldText = text_1.innerText;
            const newText = text_2.innerText;

            // change background color based on insertion or deletion between two versions
            try {
                const diff = Diff.diffWordsWithSpace(oldText, newText);

                let oldTextHtml = '';
                let newTextHtml = '';

                diff.forEach(part => {
                    if (part.added) {
                        newTextHtml += `<span class="diff-added">${part.value}</span>`;
                    } else if (part.removed) {
                        oldTextHtml += `<span class="diff-removed">${part.value}</span>`;
                    } else {
                        oldTextHtml += part.value;
                        newTextHtml += part.value;
                    }
                });

                text_1.innerHTML = oldTextHtml;
                text_2.innerHTML = newTextHtml;

            } catch (error) {
                alert('An error occurred while calculating the differences: ' + error.message);
                // Optionally, provide a fallback diff functionality or display an error message
            }

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


    var languageGuideSelect = document.getElementById('guideSelect');
    var popupTitle = document.getElementById('popup-title');
    var popupMessage = document.getElementById('popup-message');
    var popup_section_title_1 = document.getElementById('popup_section_title_1');
    var subtitle1 = document.getElementById('subtitle1');
    var subtitle2 = document.getElementById('subtitle2');
    var subtitle1Content = document.getElementById('subtitle1Content');
    var subtitle2Content = document.getElementById('subtitle2Content');
    var popup_section_title_2 = document.getElementById('popup_section_title_2');
    var popup_section_text_2 = document.getElementById('popup_section_text_2');
    var popup_section_title_3 = document.getElementById('popup_section_title_3');
    var popup_section_text_3 = document.getElementById('popup_section_text_3');
    var hybrid_method_1 = document.getElementById('hybrid_method_1');
    var hybrid_method_text_1 = document.getElementById('hybrid_method_text_1');
    var entities_search_1 = document.getElementById('entities_search_1');
    var entities_search_text_1 = document.getElementById('entities_search_text_1');


    languageGuideSelect.addEventListener('change', function() {
        var selectedLanguage = languageGuideSelect.value;
        switch (selectedLanguage) {
            case "guide_french":
                popupTitle.textContent = "Guide pour comparaison de textes";
                popupMessage.textContent = `Cet outil permet de comparer deux textes en utilisant plusieurs méthodes de similarité : lexicale, avec des embeddings, ou les deux (hybride).
    Deux phrases similaires sont surlignées dans la même couleur.
    Pour chaque méthode, vous pouvez utiliser plusieurs métriques pour mesurer la similarité.`;
                popup_section_title_1.textContent = `Choisir des phrases similaires`;
                subtitle1.textContent = 'Top% Quartile';
                subtitle2.textContent = 'Avec score de similarité';
                subtitle1Content.textContent = `Vous devez ajuster le curseur pour définir ce qu'est le quantile : le seuil en dessous duquel un certain pourcentages des phrases les plus
                similaires se situe.
                \nSi le quantile est de 0.9, le top 10 % des phrases les plus similaires sont appariées. Si le quantile est de 0.1, ce sont les Top 90 % plus similaires.`;
                subtitle2Content.textContent = `Vous devez ajuster le curseur pour définir le score de similarité minimal. Les paires de phrases auront des scores de similarité
                supérieurs à ce score.\n
                Si le score est de 0.9, les paires de phrases auront un score de similarité supérieur à 0.9.`
                popup_section_title_2.textContent = 'Similarité lexicale';
                popup_section_text_2.textContent = `La similarité lexicale évalue la similitude entre deux morceaux de texte en analysant
                leurs mots et leur agencement. Elle se base sur l'utilisation précise des mots dans le texte,
                comparant ainsi les structures textuelles de manière superficielle.`;
                popup_section_title_3.textContent = 'Similarité avec les embeddings';
                popup_section_text_3.textContent = `L'utilisation des embeddings prend également en compte la similarité
                sémantique. Elle repose sur les concepts sous-jacents et la compréhension contextuelle du langage, 
                plutôt que sur la ressemblance structurelle.`
                hybrid_method_1.textContent = 'Méthode hybride';
                hybrid_method_text_1.textContent = `La méthode hybride prend en compte à la fois la méthode lexicale 
                et celle utilisant les embeddings.\n Utilisez le curseur pour choisir quelle méthode vous souhaitez utiliser
                le plus. Une valeur de 0 utilise uniquement les embeddings, une valeur de 1 utilise uniquement la méthode lexicale,
                et une valeur de  0.5 utilise les deux méthodes de manière égale.`;
                entities_search_1.textContent = "Recherche d'entités";
                entities_search_text_1.textContent = `
                Vous pouvez filtrer et sélectionner des phrases dans les deux textes contenant un mot spécifique comme un nom d'entité.\n
                `;

                exact_diff_1.textContent = "Afficher les différences exactes";
                exact_diff_text_1.textContent = `Dans le mode recherche d'entités, le bouton "Exact diff" affiche les différences exactes entre les phrases. En rouge sont les suppressions et en vert sont les ajouts.`;


                break;


            case "guide_english":
                popupTitle.textContent = "Guide for Text comparison";
                popupMessage.textContent = `This tool allows to compare two texts based on several similarity methods: lexical, with embeddings, or both (hybrid).
            Two similar sentences are highlighted in the same color.
            For each method, you can use several metrics to measure similarity.`;
            popup_section_title_1.textContent.textContent = 'Choosing similar sentences';
            subtitle1.textContent = 'Top% Quantile';
            subtitle2.textContent = 'With similarity score';
            subtitle2Content.textContent = `You have to adjust the slider to define what is the minimal similarity score.All paired sentences will have similarity scores
                superior to this score.\n
                If the score is 0.9, all paired sentences have a similarity score greater than 0.9.`;
            subtitle1Content.textContent = `You have to adjust the slider to define what the quantile is: the threshold below which a certain percentage
                of the most similar sentences falls.\n
                If the quantile is 0.9, the top 10% most similar sentences are paired. If the quantile is 0.1, it's the top 90%.
            `
            popup_section_title_2.textContent = 'Lexical similarity';
            popup_section_text_2.textContent  = `Lexical similarity measures how similar two pieces of text are based on their words and their arrangement.
              It relies on the exact words used in the text, comparing text at the surface level.`;
            popup_section_title_3.textContent = 'Similarity with embeddings';
            popup_section_text_3.textContent = `Using embeddings takes also into account semantic similarity. It is based on the underlying concepts and contextual
                understanding of language instead of the structural ressemblance.`;
            hybrid_method_1.textContent = 'Hybrid method';
            hybrid_method_text_1.textContent = `
            The hybrid method takes into account both the lexical method and the one with embeddings.\n
            Use the slider to choose what method you want to use the most. 0 value means you only use embeddings, 1 means you only use
            the lexical method, and 0.5 means you use both methods equally.`;
            entities_search_1.textContent = 'Entities search'
            entities_search_text_1.textContent = `You can filter and select sentences in both texts containing a specific word such as an entity name.\n
          `;

          exact_diff_1.textContent = "Show exact differences";
          exact_diff_text_1.textContent = `In entity search mode, the "Exact diff" button displays the exact differences between the sentences. Deletions are shown in red, and additions are shown in green.`;
          


            default:
                break;
        }
    })

    switch (selectedLanguage) {
        case "Français":
            popupTitle.textContent = "Guide pour comparaison de textes";
            break;
        default:
            break;
    }

    
});
