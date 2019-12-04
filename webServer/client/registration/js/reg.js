
class Alert{
    constructor(message){
        this.container = document.createElement('div');
        this.container.className = 'alert';
        this.container.innerHTML =`<strong>error:</strong> ${message} `;
        document.body.appendChild(this.container);
        TweenMax.to(this.container.style,10,{opacity:0, onComplete:()=>{this.container.remove(); delete this;}})
    }
}

document.getElementById('btn2').addEventListener('click',
()=>{
    let nick = document.getElementById('nickname').value;
    let mail = document.getElementById('mail').value;
    let ps1 = document.getElementById('pass1').value;
    let ps2 = document.getElementById('pass2').value;
    
    if(ps1===ps2&&ps1.length!=0&&ps2.length!=0){
        fetch('/reg', { 
            method: 'POST', 
            headers: { 
            'Content-Type': 'application/json' 
            }, 
            body: JSON.stringify({ 
            user: { 
            nickname: nick, 
            email: mail,
            password:ps1 
            } 
            }) 
            });
            
    }
  

},false);