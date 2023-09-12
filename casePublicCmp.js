import { api, LightningElement, track, wire } from 'lwc';
import saveRecord from '@salesforce/apex/CasePublicService.saveRecord';
import getDynamicFields from '@salesforce/apex/CasePublicService.getDynamicFields';
import saveContact from '@salesforce/apex/CasePublicService.saveContact';
import casepublicassets from '@salesforce/resourceUrl/casepublicassets';
// import iconFB from '@salesforce/resourceUrl/IconoFacebook';
// import iconWA from '@salesforce/resourceUrl/IconoWhatsApp';

import customCSS from '@salesforce/resourceUrl/lightningOutCSS';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';

import { getPicklistValuesByRecordType } from 'lightning/uiObjectInfoApi';
import CASE_OBJECT from '@salesforce/schema/Case';

export default class CasePublicCmp extends LightningElement {
	caseRecord = new CaseExtend();


	checked = false;
	//Cambios Alan
	fechaNacimiento = false;
	available = false;
	showSpinner = false;
	phoneAvailable = true;
	mailAvailable = false;
	fechaDeNacimiento;
	radioValue = '';
	notAvailableNC = false;
	checkBoxCC = false;
	valueNC = '';
	numCliente = true;
	// selectedOption;

	SiTengo = false;
	FechaValida = false;
	size = 0;
	fb = casepublicassets + '/Path.png';
	wa = casepublicassets + '/WA.png';
	tel = casepublicassets + '/Local_Phone.png';
	succesIcon = casepublicassets + '/Succes.png';
	// fb = iconFB;
	// wa = iconWA;

	connectedCallback() {
        loadStyle(this, customCSS);
    }

    radioValues = [
        { label: 'Teléfono', value: 'phone' },
    	{ label: 'Correo Electrónico', value: 'mail' },
    ];
	radioValues2 = [
        // { label: 'No me sé mi número de cliente', value: 'NoNC' },
		{ label: 'Sí tengo crédito Coppel', value: 'SiTCC' },
		{ label: 'No tengo crédito Coppel', value: 'NoTCC' },
    ];
	radioValues3 = [
		{ label: 'Número de cliente', value: 'Num' },
    	{ label: 'Fecha de nacimiento', value: 'Fecha' },
    ];
	value = '';
	value2 = '';
	value3 = '';
	value4 = ''; 
	

	// Listas sin modificar de cada campo de selección que es filtrado
	causeData;
	subCauseData;
	areaData;

	@api origin;

	decisionUrl = casepublicassets + '/decision.png';
	okUrl = casepublicassets + '/ok.png';


	causeDisabled = true;
	subCauseDisabled = true;
	areaDisabled = true;
	causeHasSubCauses = false;

	@track causeSelected = undefined;
	@track subCauseSelected = undefined;
	@track areaSelected = undefined;

	disabledQuejaExpressButton = false;
	disabledDatosCompletosButton = false;
	disabledGuardarDatosCompletosButton = false;

	isFechaValida = true;

	clientNumber = '';
	firstName = '';
	firstLastName = '';
	secondLastName = '';
	@track cuentasAbonadasSelected = [];
	diaNacimiento = '';
	mesNacimiento = '';
	anioNacimiento = '';
	email = '';
	phoneNumber = '';
	@track birthdate = undefined;
	hourRangeContact = '';

	@track caseTicket = '';

	// Primer pantalla
	@track showCaseTypeSelector = true;
	@track showQueryFields = false;
	@track showInitialFields = true;

	//Pantalla de decisión y thankyoupage de campos minimos
	@track showDesition = false;
	@track showMinimalRegisterResults = false; //false

	// Pantalla de campos complementarios y thankyoupage con folio
	@track showReportFields = false;
	@track showCaseRegisterResults = false;

	@track showUserFields = false;

	typeList;
	causeList;
	subCauseList;
	areaList;

	// Cambio Alan 
	@track contactoList = [];
	medioElegido;

	@track diasList = [];
	@track mesesList = [];
	@track aniosList = [];
	@track aniosCumpleList = [];

	// ------ Nueva forma de desplegar campos, de manera dinamica ---
	@track dynamicFields = [];
	//---------------------------------------------------------------

	@track campos = {
		Fecha: {visible: false, required: false, valida: true, dia: '', mes: '', anio: '', class: 'fechaGrp'},
		FechaAproximada: {visible: false, required: false, valida: true, dia: '', mes: '', anio: '', hora: '', class: 'fechaAproximadaGrp'},
		FechaInicioContacto: {visible: false, required: false, valida: true, dia: '', mes: '', anio: '', class: 'fechaContactoGrp'},
		FechaDevolucion: {visible: false, required: false, valida: true, dia: '', mes: '', anio: '', class: 'fechaDevolucionGrp'},
		FechaCompra: {visible: false, required: false, valida: true, dia: '', mes: '', anio: '', class: 'fechaCompraGrp'},
		FechaNacimiento: {visible: false, required: false, valida: true, dia: '', mes: '', anio: '', class: 'fechaNacimientoGrp'},
	}

	@wire(getPicklistValuesByRecordType, {
        recordTypeId : '0124W000001bMnyQAE',
        objectApiName : CASE_OBJECT
    })
	wiredRecordtypeValues({data, error}){
		if(data){
			this.typeList = data.picklistFieldValues.Type.values;

			this.typeList = this.typeList.filter(opt => opt.value != 'Solicitud Interna');

			this.causeData = data.picklistFieldValues.CP_Cause__c;
			this.subCauseData = data.picklistFieldValues.CP_SubCause__c;
			this.areaData = data.picklistFieldValues.CP_Area__c;
		}
		if(error){
			console.log(error);
		}
	}

	constructor() {
		super();

		// Cambio Alan 
		this.contactoList.push({value: "telefono", label: "Teléfono"});
		this.contactoList.push({value: "correo", label: "Correo Electrónico"});
	}

	handleDescriptionChanged(event) {
		this.caseRecord.Description = event.target.value;
		this.size = this.caseRecord.Description.length;
		// console.log('Este es el tamaño del text area : ', this.size);
		this.showUserFields = true && this.caseRecord.Description != '' && this.caseRecord.Subject != undefined && this.caseRecord.Subject != '';
	}

	handleClientNumber(event) {
		this.clientNumber = event.target.value;
		this.valueNC = event.target.value;
		this.caseRecord.CP_CoppelCustomerNumber__c = this.clientNumber.trim();
		// console.log('Este es el valor de clientNumber : ', this.clientNumber);
		// console.log('Este es el valor de value2 : ', this.value2);
		// if(this.clientNumber != ''){
		// 	this.value2 = undefined;
		// 	this.fechaNacimiento = false;
		// }
		// }else{
		// 	this.fechaNacimiento = false;
		// }
	}

	handleFirstNameChanged(event) {
		this.firstName = event.target.value;
		this.caseRecord.SuppliedName = this.firstName.trim();
	}

	handleFirstLastNameChanged(event) {
		this.firstLastName = event.target.value;
		this.caseRecord.CP_SuppliedLastName1__c = this.firstLastName.trim();
	}

	handleSecondLastNameChanged(event) {
		this.secondLastName = event.target.value;
		this.caseRecord.CP_SuppliedLastName2__c = this.secondLastName.trim();
	}

	handleEMailChanged(event) {
		this.email = event.target.value;
	}

	handlePhoneChanged(event) {
		this.phoneNumber = event.target.value;
		this.caseRecord.SuppliedPhone = this.phoneNumber.trim();
	}

	handleOnlyNumbers(evt) {
		var charCode = (evt.which) ? evt.which : evt.keyCode;
		const controlOrCommand = evt.ctrlKey === true || evt.metaKey === true;
		const shiftKey = evt.shiftKey;

		//TODO: Validar cuando se presiona la tecla de acento y después una tecla de un simbolo, porque no está entrando la validación correctamente.

		if(((charCode >= 48 && charCode <= 57) || (charCode >= 96 && charCode <= 105) || charCode == 8 || charCode == 9 || charCode == 35 || charCode == 36 || charCode == 37 || charCode == 39 || charCode == 46) && !controlOrCommand && !shiftKey) {
			return true;
		} else {
			evt.preventDefault();
			return false;
		}
	}

	// Cambio Alan 
	handleMedioContactoChange(event){
		this.medioElegido = event.target.value ? event.target.value : '';
		if(this.medioElegido == 'telefono'){
			this.phoneAvailable = true;
			this.mailAvailable = false;
		}else if (this.medioElegido == 'correo'){
			this.mailAvailable = true;
			this.phoneAvailable = false;
		}
	}
	handleFechaDeNacimiento(event){
		this.fechaDeNacimiento = event.target.value ? event.target.value : '';
		// console.log('Esta es la fecha de nacimiento : ',this.fechaDeNacimiento );
	}
	// handleChangeRadio(event){
	// 	const selectedOption = event.detail.value;
    //     // console.log('Option selected with value: ' + selectedOption);
	// 	if(selectedOption == 'mail'){
	// 		this.mailAvailable = true;
	// 		this.phoneAvailable = false;
	// 	}else if (selectedOption == 'phone'){
	// 		this.phoneAvailable = true;
	// 		this.mailAvailable = false;
	// 	}
	// }

	handleClickTel(){
		this.phoneAvailable = true;
		this.mailAvailable = false;
	}
	handleClickCorreo(){
		this.mailAvailable = true;
		this.phoneAvailable = false;
	}

	handleChangeRadio2(event){
		const selectedOption = event.detail.value;
		this.value2 = selectedOption;
		// console.log('Este es el this.FechaValida : ', this.FechaValida);
        // console.log('Option selected with value: ' + selectedOption + ' y este es el valorNC : ' + this.valueNC);
		if(selectedOption == 'SiTCC'){
			// this.fechaNacimiento = true;
			this.SiTengo = true;
			// this.valueNC = undefined;
			// this.FechaValida = true;
			// this.checkBoxCC = false;
			// this.notAvailableNC = true;
			// this.value3 == 'Fecha' ? this.value3 = '' : '' ;
			// this.fechaNacimiento = false;
		}else if(selectedOption == 'NoTCC'){
			this.fechaNacimiento = false;
			// this.numCliente = false;
			this.SiTengo = false;
			this.valueNC = undefined;
			// this.FechaValida = false;
			// this.checkBoxCC = true;
			// this.notAvailableNC = false;
		}
	}
	// handleChangeRadio3(event){
	// 	// const cb = this.template.querySelector('#Check');
	// 	// console.log(cb.checked);
	// 	// this.checked = !this.checked;
	// 	const selectedOption = event.detail.value;
    //     // console.log('Option selected with value change: ' + selectedOption);
	// 	if(selectedOption == 'Fecha'){
	// 		// this.checkBoxCC = true;
	// 		this.fechaNacimiento = true;
	// 		// this.notAvailableNC = true;
	// 		// this.SiTengo = false;
	// 		this.valueNC = undefined;
	// 		// this.value2 = undefined;
	// 		// this.value3 = 'Fecha';
	// 		this.numCliente = false;
	// 	}else if(selectedOption == 'Num' ){
	// 		this.fechaNacimiento = false;
	// 		this.numCliente = true;
	// 		// this.notAvailableNC = false;
	// 		// this.SiTengo = true;
	// 	}
		// console.log('Este es el valor de checkBoxCC : ' + this.checkBoxCC);
	// }
	handleClickNumCliente(event){
		this.fechaNacimiento = false;
		this.numCliente = true;
	}
	handleClickFecha(event){
		this.fechaNacimiento = true;
		this.numCliente = false;
		this.valueNC = undefined;
	}


	// handleClickRadio(event){
	// 	const selectedOption = event.detail.value;
	// 	console.log('Este es el valor de selected : ' + selectedOption + ' y este es el value 4 : ' + this.value4);
	// 	if(selectedOption == undefined || selectedOption == ''){
	// 		// this.value4 == 'NoTCC';
	// 		console.log('este es el value 4  NoTCC: ' + this.value4);
	// 	}else if(selectedOption == 'NoTCC'){
	// 		// this.value4 = undefined;
	// 		console.log('este es el value 4  undefined: ' + this.value4);
	// 	}
	// }

	visitarCoppel(){
		window.open("https://www.coppel.com","_self");
	}

	handleGeneric(event) {
		this.caseRecord[event.target.name] = event.target.value;
	}

	save() {
		var fieldValidated = this.validateFields();

		if(fieldValidated && fechasValidated) {

			this.disabledGuardarDatosCompletosButton = true;

			var obj = {firstName: this.firstName, firstLastName: this.firstLastName, secondLastName: this.secondLastName, phoneNumber: this.phoneNumber, email: this.email, birthdate: this.birthdate, hourRangeContact: this.hourRangeContact};

			if(this.clientNumber.trim() != '') {
				obj["clientNumber"] = this.clientNumber.trim();
			}

			saveContact(obj).then((response) => {
				if(response) {
					this.caseRecord.ContactId = response;

					console.log("SaveContact(Report)-OK: ");
					console.dir(response);

					saveRecord({param: this.caseRecord, origin: this.origin, typeRecord: 2}).then((response) => {
						console.log("SaveRecord(Report)-OK: ");
						console.dir(response);

						this.showCaseTypeSelector = false;
						this.showQueryFields = false;
						this.showReportFields = false;
						this.showCaseRegisterResults = true;
						this.caseTicket = response;

					}, (errors) => {
						console.log("SaveRecord(Report)-Error: Response");
						console.dir(errors);
						this.disabledGuardarDatosCompletosButton = false;
					});
				} else {
					console.log('No guardó contacto, devolvió NULL.');
					this.disabledGuardarDatosCompletosButton = false;
				}
			}, (errors) => {
				console.error("SaveContact(Report)-Error: ");
				console.dir(errors);
				this.disabledGuardarDatosCompletosButton = false;
			});
		}
	}

	//Cambio Alan (Se agregó lightning-radio-group en el querySelectorAll)
	validateFields() {
		const allValid = [...this.template.querySelectorAll('lightning-input,lightning-textarea,lightning-combobox,lightning-radio-group'),].reduce((validSoFar, inputCmp) => {
            inputCmp.reportValidity();
            return validSoFar && inputCmp.checkValidity();
        }, true);
		return allValid;
    }

	saveMinimalData() {
		if(this.validateFields()) {
			this.disabledQuejaExpressButton = true;
			this.disabledDatosCompletosButton = true;
			// Cambio Alan
			this.available = true;
			this.showSpinner = true;

			// Cambio Alan (cambio birthday por fechaDeNacimiento)
			// saveContact({firstName: this.firstName, firstLastName: this.firstLastName, secondLastName: this.secondLastName, phoneNumber: this.phoneNumber, email: this.email, clientNumber: this.clientNumber, birthdate: this.birthdate, hourRangeContact: this.hourRangeContact}).then((response) => {
			console.log('Valores Nombre : ', this.firstName, ' + apellido ', this.firstLastName, ' + apellido 2 ', this.secondLastName, ' + numero ', this.phoneNumber, ' + correo ', this.email, ' + numero cliente ', this.clientNumber, ' + nacimiento ', this.fechaDeNacimiento, ' + checkBox ', this.checkBoxCC);
			saveContact({firstName: this.firstName, firstLastName: this.firstLastName, secondLastName: this.secondLastName, phoneNumber: this.phoneNumber, email: this.email, clientNumber: this.clientNumber, birthdate: this.fechaDeNacimiento, hourRangeContact: this.hourRangeContact, checkBox: this.checkBoxCC}).then((response) => {
				if(response) {
					this.caseRecord.ContactId = response;

					console.log("SaveContact(Report)-OK: ");
					console.dir(response);

					// Cambio Alan (Cambio el typeRecord: 1 a 3) 
					saveRecord({param: this.caseRecord, origin: this.origin, typeRecord: 3}).then((response) => {
						this.showDesition = false;
						// Cambio Alan
						this.showSpinner = false;
						this.showInitialFields = false;

						this.showMinimalRegisterResults = true;
					}, (errors) => {
						console.log("SaveRecord(Report)-Error: ");
						console.dir(errors);
						this.disabledQuejaExpressButton = false;
						this.disabledDatosCompletosButton = false;
					});
				} else {
					console.log('No guardó contacto, devolvió NULL.');
					this.disabledQuejaExpressButton = false;
					this.disabledDatosCompletosButton = false;
				}
			}, (errors) => {
				console.error("SaveContact(Report)-Error: ");
				console.dir(errors);
				this.disabledQuejaExpressButton = false;
				this.disabledDatosCompletosButton = false;
			});
		}
	}
}

export class CaseExtend {
	constructor() {
		//this.Contact = new ContactExtend();
	}
	Type;
	CP_Cause__c;
	CP_SubCause__c;
	CP_Area__c;
	Subject;
	Description;
	ContactId;
	AccountId;
	RecordTypeId;
	CP_Monto__c
	CP_NoTengoCreditoCoppel__c
}