var connection;

var openRequest = window.indexedDB.open('contactRecordDb', 1);

let $p = document.querySelector.bind(document);


openRequest.onupgradeneeded = e => {

    console.log('Cria ou altera um banco já existente');

    let minhaConnection = e.target.result;

    if(minhaConnection.objectStoreNames.contains('contatos')) {
        minhaConnection.deleteObjectStore('contatos');
    }

    minhaConnection.createObjectStore('contatos', { autoIncrement: true});
};

openRequest.onsuccess = e => {
    console.log('Conexão obtida com sucesso');
    connection = e.target.result;
    listaTodos();

};
openRequest.onerror = e => {
    // console.log(e.target.error);
    Materialize.toast('Erro : conectar ao banco: ' + e.target.error.name, 3000, 'red-text');
};

function adiciona(event) {
    event.preventDefault();
    if(!$p('#nome').value){
      Materialize.toast('O nome esta vazio', 3000, 'red-text');
      return
    }

    let store = connection.transaction(['contatos'], 'readwrite').objectStore('contatos');

    let contato = new Contato($p('#nome').value,$p('#email').value,$p('#celular').value);
    let request = store.add(contato);

    request.onsuccess = e => {
        Materialize.toast("Contato " + $p('#nome').value + ' adicionado', 1000);
        _limpaFormulario();
        listaTodos();
    };

    request.onerror = e => {
        // console.log(e);
        Materialize.toast('Erro: ' + e.target.error.name, 3000, 'red-text');
    };
}

function listaTodos() {

    let store = connection.transaction(['contatos'], 'readwrite').objectStore('contatos');
    let cursor = store.openCursor();

    let contatos = [];

    cursor.onsuccess = e => {
        let atual = e.target.result;
        if(atual) {
            let dado = atual.value;
            contatos.push({'key':atual.key,'contato':new Contato(dado._nome, dado._email, dado._celular)});
            atual.continue();
        } else {
            console.log(contatos);
            inserirNaLista(contatos);
        }
    };

    cursor.onerror = e => {
        // console.log(e.target.error.name);
        Materialize.toast('Erro: ' + e.target.error.name, 3000, 'red-text');
    };
}
function inserirNaLista(contatos){
  $("#listar").html('');
  $.each(contatos,function(key,value){
    // console.log(value);
    var card = `
    <div class="col s12 contato" id="${value.key}">
      <div class="card white">
          <button data-key="${value.key}" onclick="apagaContato(event);" id="excluirContato" class="btn white right waves-effect waves-red black-text">Excluir</button>
          <div class="col s6">
            <label class="label black-text">Nome: </label>
            <label class="label black-text">${value.contato._nome}</label>
          </div>
          <div class="col s6">
            <label >Email:</label>
            <label >${value.contato._email}</label>
          </div>
          <div class="col s10">
            <label >Numero: </label>
            <label >${value.contato._celular}</label>
          </div>
      </div>
    </div>
    `;
    $("#listar").append(card);
  });
}

function apagaContato(event){
  var id = event.target.dataset.key;

  let request = connection.transaction(['contatos'], 'readwrite').objectStore('contatos').delete(id);
  request.onsuccess = e => {
      Materialize.toast("Contato apagado com sucesso", 1000);
      $(`#${id}`).fadeOut('slow',function(){$(`#${id}`).remove()});
  };

  request.onerror = e => {
      // console.log(e);
      Materialize.toast('Erro: ' + e.target.error.name, 3000, 'red-text');
  };

}

function apagaTodos(){
  let request = connection.transaction(['contatos'], 'readwrite').objectStore('contatos').clear();
  request.onsuccess = e => {
      Materialize.toast("Contatos apagados com sucesso", 1000);
      $('.contato').fadeOut('slow',function(){$(`.contato`).remove()})
  };

  request.onerror = e => {
      // console.log(e);
      Materialize.toast('Erro: ' + e.target.error.name, 3000, 'red-text');
  };
}


function _limpaFormulario() {
  $p('#nome').value = '';
  $p('#email').value = '';
  $p('#celular').value = '';
  $p('#nome').focus();
}
