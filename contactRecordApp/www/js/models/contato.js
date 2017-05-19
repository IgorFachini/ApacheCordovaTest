class Contato {

    constructor(nome, email, celular) {

        this._nome = nome;
        this._email = email;
        this._celular = celular;
        Object.freeze(this);
    }

    get nome() {

        return this._nome;
    }

    get email() {

        return this._email;
    }

    get celular() {

        return this._celular;
    }
}
