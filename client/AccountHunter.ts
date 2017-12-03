class Student {
    fullName : string;
    constructor( public firstName: string, lastName: string ) {
        this.fullName = firstName + " " + lastName;
    }
}

document.body.innerHTML = "test";