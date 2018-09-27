function getGameEvents(callbackFn) {
    $.ajax({
        headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`
        },
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


function saveEditGame(gameID, callbackFn) {
    const gameTitle = $("#gameTitle").val();
    const maxPlayers = $("#maxPlayers").val(); //const user = $("#username").val();
    const user = localStorage.getItem("user_id");
    const address = $("#address").val();
    const gameInfo = $("#gameInfo").val();
    const gameDateTime = $("#gameDateTime").val();

    const newGame = {
        gameTitle: gameTitle,
        maxPlayers: maxPlayers,
        user: user,
        address: address,
        gameDateTime: new Date(gameDateTime).toISOString(),
        gameInfo: gameInfo,
    };
    console.log('newGameput', newGame);


    $.ajax({
        headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`
        },
        type: 'PUT',
        url: `/api/gameEvents/${gameID}`,
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify(newGame),
        success: callbackFn,
        error: err => {
            alert('Internal Server Error (see console)');
            console.error(err);
        }
    });
    //localStorage.removeItem('')
    event.preventDefault();
}


function getGameEvent(gameid, callbackFn) {
    //data-game-id="${this.id}"

    $.ajax({
        headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`
        },
        type: 'GET',
        url: `/api/gameEvents/${gameid}`,
        contentType: 'application/json',
        dataType: 'json',
        //data: JSON.stringify(data),
        success: callbackFn,
        error: err => {
            alert('Internal Server Error (see console)');
            console.error(err);
        }
    });
}

function displayGameEvent(data) {
    console.log(data);
    //let varrr = {this.gameTitle};
}

function displayGameEvents(gameEvents) {

    $.each(gameEvents, function (index, gameEvent) {
        //IF user created game add user buttons
        //$('#userButtons').append(`
        //<button type="submit" id="editBtn" class="button">Edit Game</button>
        //<button type="submit" id="deleteBtn" class="button">Delete Game</button>


        //IF LOGGED IN AND CREATED EVENT DO THIS
        $('.cards').append(`
        <div id="game-summary" data-game-id="${gameEvent.id}">
            <button class="accordion">
                ${gameEvent.gameTitle}<br/>
                ${new Date(gameEvent.gameDateTime).toLocaleDateString()} 
            </button>
            <div class="panel">
              <p>HOST: ${gameEvent.user.username}</p>
              <p>DESCRIPTION: ${gameEvent.gameInfo}</p>
              <p>MAX PLAYERS: ${gameEvent.maxPlayers}</p>
              <p>ADDRESS: ${gameEvent.address}</p>
              <p>TIME: ${new Date(gameEvent.gameDateTime).toLocaleTimeString()}</p>
              <div id="userButtons">
                <button type="button" id="goToEditGameBtn" class="button">Edit Game</button>
                <button type="button"  id="deleteGameBtn">Delete Game</button>
                </div>
            </div>
        </div>
        `);

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
    //$('#js-create-form').on('submit', function (event) {
    const gameTitle = $("#gameTitle").val(); //const gameTitle = $gameTitle;
    const maxPlayers = $("#maxPlayers").val();
    const user = $("#username").val();
    const address = $("#address").val();
    const gameDateTime = $("#gameDateTime").val();
    const gameInfo = $("#gameInfo").val();

    const newGame = {
        gameTitle: gameTitle,
        maxPlayers: maxPlayers,
        user: user,
        address: address,
        gameInfo: gameInfo,
        gameDateTime: new Date(gameDateTime).toISOString()
    };

    $.ajax({
        headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`
        },
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
}

function backToDashboard() {
    console.log("back to dash");
    renderDashboard(); //window.open('../index.html', '_self'); //window.location.replace('../index.html');
}

function deleteGameEvent(gameID) {
    //need to find id first
    //$(".cards").on('click', '#deleteBtn', function (event) {
    //console.log('clicked delete btn');
    //event.stopImmediatePropagation();
    //const gameID = $(event.currentTarget)
    //    .closest('#game-summary').attr('data-game-id');
    //console.log(gameID);

    $.ajax({
        headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`
        },
        type: 'DELETE',
        url: `/api/gameEvents/${gameID}`, //:id'
        success: () => {
            alert("deleted event");
            renderViewGames();
            getAndDisplayGameEvents();
            //window.open('../post/read.html', '_self');
        },
        error: err => {
            alert('Internal Server Error (see console)');
            console.error(err);
        }
    });
}




//const store = {
//    myToken = localStorage.getItem("token") //"";
//store.authToken = response.authToken;
//}


let STATE = {
    isLoggedIn: false
};

function updateAuthenticatedUI() {
    const authUser = getAuthenticatedUserFromCache();
    if (authUser) {
        STATE.authUser = authUser;
        //console.log("state " + STATE.isLoggedIn);
    }
    //else {
    //console.log('no auth');
    //$('#default-menu').removeAttr('hidden');
    //}
}


function getAuthenticatedUserFromCache() {
    const authToken = localStorage.getItem('authToken');
    const username = localStorage.getItem('username');
    if (authToken) {
        return {
            authToken,
            username
        };
    } else {
        return undefined;
    }
}


//  on page load do this
$(function () {

    updateAuthenticatedUI();
    bindEvents();

    if (STATE.authUser) {
        //console.log("logged in " + STATE);
        renderDashboard();
    } else {
        //console.log("not logged in " + STATE);
        renderIntro();
    };

});



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
    //$('#js-login-form').on('submit', function (event) {
    //console.log('clicked log');
    const username = $("#username").val();
    console.log({
        username
    });
    const password = $("#password").val();
    const newUser = {
        username: username,
        password: password
    }; //console.log(newUser);
    event.preventDefault();
    console.log('newUser', newUser.username);

    $.ajax({
        type: 'POST',
        url: '/api/auth/login/',
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify(newUser),
        success: res => {
            localStorage.setItem('authToken', res.authToken);
            localStorage.setItem('username', newUser.username);
            localStorage.setItem('user_id', newUser.id);
            console.log('setitem ' + newUser.username)
            console.log('localstorage set');
            STATE.isLoggedIn = true;
            renderDashboard();
        }
    });
};


function logout() {
    localStorage.removeItem('authToken'); //, res.authToken);
    localStorage.removeItem('username'); //, res.user.username);
    STATE.isLoggedIn = false;
    console.log("logout clicked STATE is now " + STATE.isLoggedIn);
}



function signup() {
    //$('#js-signup-form').on('submit', function (event) {
    console.log('clicked signup');
    const username = $("#username").val();
    const password = $("#password").val();
    //add more stuff later maybe
    const newUser = {
        username: username,
        password: password
    };
    $.ajax({
        type: 'POST',
        url: '/api/users/',
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify(newUser),
        success: res => {
            goToLogin(res);
        },
        //callback: user => {
        //    alert(`User ${user.username} created. Please login.`) // window.open('./login.html', '_self');
        //},
        //success: goToLogin,
        error: err => {
            alert('Internal Server Error (see console)');
            console.error(err);
        }
    });
    event.preventDefault();
}

function goToLogin() {
    // alert(`User ${user.username} created, please login`);
    renderLogin();
    //window.open('./login.html', '_self');
}






function bindEvents() {
    $('#main').on('click', '#goToLoginBtn', (event) => {
        renderLogin();
    });
    $('#main').on('submit', '#js-login-form', (event) => {
        login();
    });
    $('#main').on('submit', '#js-signup-form', (event) => {
        signup();
    });

    $('#main').on('click', '#goToSignupBtn', renderSignup);

    $('#main').on('click', '#viewGamesBtn', (event) => {
        getAndDisplayGameEvents();
        renderViewGames();
    });

    $('#main').on('click', '#hostAGameBtn', renderHostAGame);

    $('#main').on('click', '#renderDashboardBtn', renderDashboard);

    $('#main').on('click', '#logoutBtn', (event) => {
        logout();
        renderIntro();
    });

    $('#main').on('submit', '#js-create-form', addNewGameEvent);

    $('#main').on('click', '#goToEditGameBtn', (event) => {
        const gameEventId = $(event.currentTarget).closest('#game-summary').attr('data-game-id');
        getGameEvent(gameEventId, renderEditGame);
    });

    $('#main').on('submit', '#js-edit-form', (event) => {
        const gameEventId = $(event.currentTarget).attr('data-game-id');
        saveEditGame(gameEventId, backToDashboard);
    });

    $('#main').on('click', '#deleteGameBtn', (event) => {
        const gameEventId = $(event.currentTarget).closest('#game-summary').attr('data-game-id');
        deleteGameEvent(gameEventId);
    });
}