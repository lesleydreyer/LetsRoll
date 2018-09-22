function getGameEvents(callbackFn) {
    $.ajax({
        type: 'GET',
        url: '/api/gameEvents',
        contentType: 'application/json',
        dataType: 'json',
        //data: JSON.stringify(data),
        success: displayGameEvents,
        error: err => {
            alert('Internal Server Error (see console)');
            console.error(err);
        }
    });

}


function displayGameEvents(data) {
    $.each(data, function () { //for (index in data.gameEvents) {
        //GET THE DATE AND TIME
        var gameDate1 = parseInt(this.gameDate);
        //var date2 = new Date(myDate);
        var gameDate2 = new Date(gameDate1);
        var date = gameDate2.getDate();
        var month = gameDate2.getMonth(); //Be careful! January is 0 not 1
        var year = gameDate2.getFullYear();
        var dateString = date + "-" + (month + 1) + "-" + year;
        var timestamp = gameDate2.getTime();

        //IF LOGGED IN AND CREATED EVENT DO THIS
        $('.cards').append(`
        <div id="game-summary" data-game-id="${this.id}">
            <button class="accordion">
                ${this.gameTitle}<br/>
                ${dateString} 
            </button>
            <div class="panel">
              <p>HOST: ${this.host}</p>
              <p>DESCRIPTION: ${this.gameInfo}</p>
              <p>MAX PLAYERS: ${this.maxPlayers}</p>
              <p>LOCATION: ${this.address}</p>
              <p>TIME: ${this.gameTime}</p>
              <div id="userButtons">
                <button type="button" id="editBtn" class="button">Edit Game</button>
                <button type="button"  id="deleteBtn">Delete Game</button>
                </div>
            </div>
        </div>
        `);

        //IF user created game add user buttons
        //$('#userButtons').append(`
        //<button type="submit" id="editBtn" class="button">Edit Game</button>
        //<button type="submit" id="deleteBtn" class="button">Delete Game</button>

    });

    makeCollapsible();
}

//makes the viewing games expand/collapse to show more info
function makeCollapsible() {
    var acc = document.getElementsByClassName("accordion");
    var i;

    for (i = 0; i < acc.length; i++) {
        acc[i].addEventListener("click", function () {
            this.classList.toggle("active");
            var panel = this.nextElementSibling;
            if (panel.style.maxHeight) {
                panel.style.maxHeight = null;
            } else {
                panel.style.maxHeight = panel.scrollHeight + "px";
            }
        });
    }
};



function getAndDisplayGameEvents() {
    getGameEvents(displayGameEvents);
}


function addNewGameEvent() {
    $('#js-create-form').on('submit', function (event) {
        const gameTitle = $("#gameTitle").val(); //const gameTitle = $gameTitle;
        const maxPlayers = $("#maxPlayers").val();
        const host = $("#username").val();
        const street = $("#street").val();
        const city = $("#city").val();
        const state = $("#state").val();
        const zipCode = $("#zipCode").val();
        const gameInfo = $("#gameInfo").val();
        const gameDate = $("#gameDate").val();
        const gameTime = $("#gameTime").val();

        const newGame = {
            gameTitle: gameTitle,
            maxPlayers: maxPlayers,
            host: host,
            street: street,
            city: city,
            state: state,
            zipCode: zipCode,
            gameInfo: gameInfo,
            gameDate: gameDate,
            gameTime: gameTime
        };
        //console.log(newGame);

        $.ajax({
            type: 'POST',
            url: '/api/gameEvents/',
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify(newGame),
            success: backToDashboard,
            error: err => {
                alert('Internal Server Error (see console)');
                console.error(err);
            }
        });
        event.preventDefault();
    })
}

function backToDashboard() {
    console.log("back to dash");
    renderDashboard();


    //window.open('../index.html', '_self'); //window.location.replace('../index.html');
}

function deleteGameEvent() {
    //need to find id first
    $(".cards").on('click', '#deleteBtn', function (event) {
        console.log('clicked delete btn');
        event.stopImmediatePropagation();
        const gameID = $(event.currentTarget)
            .closest('#game-summary').attr('data-game-id');

        $.ajax({
            type: 'DELETE',
            url: `/api/gameEvents/${gameID}`, //:id'
            success: () => {
                alert("deleted event");
                window.open('../post/read.html', '_self');
            },
            error: err => {
                alert('Internal Server Error (see console)');
                console.error(err);
            }
        });
    });
    //event.preventDefault();
}


////////////////////////////////


let STATE = {
    isLoggedIn: false
};

//const store = {
//    myToken = localStorage.getItem("token") //"";
//store.authToken = response.authToken;
//}

function updateAuth() {
    if (STATE.isLoggedIn) {
        console.log("logged in");
        backToDashboard();
    } else {
        renderIntro();
        console.log("not logged in");
    }
}


function checkUserAuth() {
    STATE.authToken = localStorage.getItem('authToken');
    if (STATE.authToken) {
        STATE.isLoggedIn = true;
        STATE.username = localStorage.getItem('username');
        return true;
    } else {
        return false;
    }
}

//refresh
//store.authToken = localStorage.setItem('authToken', response.authToken);

//The simplest thing to do is to save the token to a variable, similar to your `myToken` variable. But I’d suggest using a `store` or `state` object just so you don’t pollute global.
//`store.authToken = response.authToken`
//Then, use that token in all the requests to the API.

//f you refresh the page, then you’ll need to login again. 
//That’s where localStorage come in. So you can store the token in localStorage like:
//`store.authToken = localStorage.setItem('authToken', response.authToken)` and then retrieve it from local storage:
//```headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },```
//access login with local and that returns the token to use with jwt so send the token for game stuff

function login() {
    $('#js-login-form').on('submit', function (event) {
        //console.log('clicked log');
        const username = $("#username").val();
        const password = $("#password").val();
        const newUser = {
            username: username,
            password: password
        }; //console.log(newUser);
        event.preventDefault();

        $.ajax({
            type: 'POST',
            url: '/api/auth/login/',
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify(newUser),
            success: res => {
                localStorage.setItem('authToken', res.authToken);
                localStorage.setItem('username', res.user.username);
                console.log('localstorage set');
                backToDashboard();
            }
        });
    });
};




function signup() {
    $('#js-signup-form').on('submit', function (event) {
        console.log('clicked signup');
        const username = $("#username").val();
        const password = $("#password").val();
        //add more stuff later

        const newUser = {
            username: username,
            password: password
        };
        console.log(newUser);
        $.ajax({
            type: 'POST',
            url: '/api/users/',
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify(newUser),
            callback: user => {
                alert(`User ${user.username} created. Please login.`) // window.open('./login.html', '_self');
            },
            //success: goToLogin,
            error: err => {
                alert('Internal Server Error (see console)');
                console.error(err);
            }
        });
        event.preventDefault();
    });
}

function goToLogin() {
    alert(`User ${user.username} created, please login`);
    //window.location.replace('./login.html');
    renderLogin();

    //window.open('./login.html', '_self');
}



//  on page load do this
$(function () {
    //getAndDisplayGameEvents(); //GET
    //addNewGameEvent(); //POST
    //deleteGameEvent(); //DELETE
    //editGameEvent(); //PUT
    //login();
    //signup();
    //updateAuth();
    //renderIntro();
    bindEvents();

    ////
    //updateAuthenticatedUI();
    if (STATE) {
        console.log("true state");
        renderDashboard();
    } else(console.log("false state"));

    //if (STATE.authUser) {
    //  HTTP.getUserNotes({
    //    jwtToken: STATE.authUser.jwtToken,
    //  onSuccess: RENDER.renderDashboard
    //});
    //}
    ////
})
debugger;

function updateAuthenticatedUI() {
    const authUser = CACHE.getAuthenticatedUserFromCache();
    if (authUser) {
        STATE.authUser = authUser;
        $('#nav-greeting').html(`Welcome, ${authUser.name}`);
        $('#auth-menu').removeAttr('hidden');
    } else {
        $('#default-menu').removeAttr('hidden');
    }
}


/////////////////////  RENDERING HTML



function renderIntro() {
    let toRender = `
    <img src="images/img1.svg">
<h1 class="redColor center fontPermMarker">LET'S ROLL</h1>
<h3 class="blueColor center fontJosefinSans">TABLETOP SCHEDULER</h3>
<p>Play more board games (or anything else) with Let's Roll tabletop scheduler! The app is still in
    production but when complete you will be able to host a game session as well as sign up to attend other
    users games, add comments, and connect to the board game geek api to grab more info on the games you
    would like to play.</p>
<p>
    <button class="homebuttons" id="loginBtn">LOG IN ></button>
    &nbsp;&nbsp;<span class="blueColor btnslash">|</span>
    &nbsp;&nbsp;
    <button class="homebuttons" id="signupBtn">SIGN UP ></button>
</p>`;
    $('#intro').html(toRender);
}



function renderLogin() {
    let toRender = `
    <h1>Log In</h1>
        <form id="js-login-form" role="login">
            <fieldset>
                <legend>Log In</legend>
                <label for="username">User Name</label>
                <input type="text" id="username" name="username" placeholder="Enter your username here" required><br />
                <label for="password">Password</label>
                <input type="text" id="password" name="password" placeholder="Enter your password here" required><br />
                <button type="submit" id="logInBtn" class="button">Log In</button>
            </fieldset>
        </form>
        <p><a id="signupBtn" href="#">Or Sign Up Here</a></p>
    `;
    $('#main').html(toRender);
}



function renderSignup() {
    let toRender = `
    <h1>Sign Up</h1>
        <form id="js-signup-form" role="signup">
            <fieldset>
                <legend>Sign Up</legend>
                <label for="userName">User Name</label>
                <input type="text" id="userName" name="userName" placeholder="Enter your username here" required><br />
                <label for="password">Password</label>
                <input type="text" id="password" name="password" placeholder="Enter your password here" required><br />
                <button type="submit" id="submitSignUpUserBtn" class="button">Sign Up ></button>
            </fieldset>
        </form>
        <p><a id="loginBtn" href="#">Or Log in Here</a></p>
    `;
    $('#main').html(toRender);
}

function renderDashboard() {
    let toRender = `
    <h1>Welcome!</h1>
        <!--<form id="goToLogin"><input type ="submit" name="submit" id="submit" value="Log In"></input></form>-->
        <!--<button id="read">view games</button>-->
        <a href="/post/read.html">
            <button id="viewGames" class="dashButton orange">
                <!--id="read"<p id="listGames">games</p>-->
                View Games ></button>
        </a>
        <a href="/post/create.html">
            <button id="create" class="dashButton blue">
                Host a Game >
            </button></a>
    `;
    $('#main').html(toRender);
}


//////////////////////// BIND EVENTS
function bindEvents() {
    $('#main').on('click', '#loginBtn', (event) => {
        //event.preventDefault();
        renderLogin();
    });
    $('#main').on('click', '#signupBtn', (event) => {
        renderSignup();
    });
    //$('#js-signup-form').on('c')
    //$('#js-signup-form').on('submit',

}