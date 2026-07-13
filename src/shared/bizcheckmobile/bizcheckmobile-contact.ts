/* eslint-disable no-unused-vars */

class Contact {
    private static instance: Contact;

    // Private constructor to prevent direct instantiation
    private constructor() { }

    // Get the singleton instance
    static getInstance(): Contact {

        if (!this.instance) {
            this.instance = new Contact();
        }
        return this.instance;

    }

    get(param:{text?: string, type?: string, callback: (response: any) => void}) {
        window.bizCheckMobile.gateway("Contact", "get", {_sSearchText: param.text, _sSearchType: param.type, _fCallback: param.callback});
    }
}

const BizCheckMobileContact = Contact.getInstance();

export default BizCheckMobileContact;