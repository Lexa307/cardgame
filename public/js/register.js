const form = document.getElementById("signUpForm");
const subButton = document.getElementById('sub')
const err = document.getElementById(`err`);
const email = document.getElementById(`mail`);
const pass = document.getElementById(`password`);
const pass2 = document.getElementById(`password2`);
const nName = document.getElementById(`username`);
const r = /[^A-Z-a-z-0-9]/;
const emailReg = /^[\w]{1}[\w-\.]*@[\w-]+\.[a-z]{2,4}$/;

function submitForm(){
    if(r.test(pass.value)){
        err.innerText = " В пароле введены недопустимые символы. Разрешены латинские буквы и цифры";
        err.style.visibility = "visible";
        return false;
    }
    if(r.test(nName.value)){
        err.innerText = " В никнейме должны быть только латинские буквы и цифры";
        err.style.visibility = "visible";
        return false;
    }
    if (pass.value.length < 6){
        err.innerText = " Слишком маленький пароль.";
        err.style.visibility = "visible";
        return false;
    }
    if (pass.value.length > 20){
        err.innerText = " Слишком длинный пароль.";
        err.style.visibility = "visible";
        return false;
    }
    if(pass.value != pass2.value){
        err.innerText = " Пароли не совпадают.";
        err.style.visibility = "visible";
        return false;
    }
    
    // subButton.disabled = true;
    let xhr = new XMLHttpRequest();
    let body = `mail=${encodeURIComponent(email.value)}&nickname=${encodeURIComponent(nName.value)}&password=${encodeURIComponent(pass.value)}&confirmpass=${encodeURIComponent(pass2.value)}`;
    xhr.open("POST",'/reg',true);
    xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
    xhr.onreadystatechange = ()=>{
        if(xhr.readyState!= 4) return;
        if(xhr.status == 200){
            let response; 
            try{response= JSON.parse(`${xhr.responseText}`);} catch(err){
                window.location.href = "/home";
            }
            console.log(response);
            if(response.message == undefined){
                window.location.href = "/home";
            }else{
                err.innerText = response.message;
                err.style.visibility = "visible";
                return false;
            }
        }
        // return false;
    }
    
    xhr.send(body);
    return false;
    

}