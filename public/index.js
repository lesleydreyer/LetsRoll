//-------------------------------------------------------------  GET ALL GAME EVENTS

function getGameEvents(callbackFn) {
    $.ajax({
        headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`
        },
        type: 'GET',
        url: '/api/gameEvents',
        contentType: 'application/json',
        dataType: 'json',
        success: renderViewGames,
        error: err => {
            alert('Something went wrong, unable to get list of games.');
            console.error(err);
        }
    });
}


function getAndDisplayGameEvents() {
    getGameEvents(renderViewGames);
}


//-------------------------------------------------------------  GET SINGLE GAME EVENT

function getGameEvent(gameid, callbackFn) {
    $.ajax({
        headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`
        },
        type: 'GET',
        url: `/api/gameEvents/${gameid}`,
        contentType: 'application/json',
        dataType: 'json',
        success: callbackFn,
        error: err => {
            alert('Internal Server Error (see console)');
            console.error(err);
        }
    });
}

//-------------------------------------------------------------  EDIT GAME EVENT

function saveEditGame(gameID) {
    const gameTitle = $('#gameTitle').val();
    const maxPlayers = $('#maxPlayers').val();
    const address = $('#address').val();
    const gameInfo = $('#gameInfo').val();
    const gameDateTime = $('#gameDateTime').val();

    const newGame = {
        gameTitle: gameTitle,
        maxPlayers: maxPlayers,
        address: address,
        gameDateTime: new Date(gameDateTime).toISOString(),
        gameInfo: gameInfo,
    };

    $.ajax({
        headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`
        },
        type: 'PUT',
        url: `/api/gameEvents/${gameID}`,
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify(newGame),
        success: () => {
            alert('Game has been edited successfully');
            getAndDisplayGameEvents();
        },
        error: err => {
            alert('Something went wrong, game edit NOT saved.');
            console.error(err);
        }
    });
    event.preventDefault();
}


//-------------------------------------------------------------  CREATE NEW GAME EVENT

function addNewGameEvent() {
    const gameTitle = $('#gameTitle').val();
    const maxPlayers = $('#maxPlayers').val();
    const address = $('#address').val();
    const gameDateTime = $('#gameDateTime').val();
    const gameInfo = $('#gameInfo').val();

    const newGame = {
        gameTitle: gameTitle,
        maxPlayers: maxPlayers,
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
        success: () => {
            alert('Game event has been created!');
            goToDashboard();
        },
        error: err => {
            alert('Something went wrong, new game NOT created.');
            console.error(err);
        }
    });
    event.preventDefault();
}


//-------------------------------------------------------------  DELETE GAME EVENT

function deleteGameEvent(gameID) {
    $.ajax({
        headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`
        },
        type: 'DELETE',
        url: `/api/gameEvents/${gameID}`,
        success: () => {
            alert('Game event has been deleted.');
            getAndDisplayGameEvents();
        },
        error: err => {
            alert('Something went wrong, unable to delete game.');
            console.error(err);
        }
    });
}

//-------------------------------------------------------------  Go TO Dashboard

function goToDashboard(user) {
    //    getAuthenticatedUserFromCache();
    updateAuthenticatedUI();
    //console.log('backtodash' + user.username);
    //let username = localStorage.getItem('username');
    //console.log('aa' + aa)
    renderDashboard(localStorage.getItem('username'));
}


//-------------------------------------------------------------  Authentication


let STATE = {
    isLoggedIn: false
};

function updateAuthenticatedUI() {
    const authUser = getAuthenticatedUserFromCache();
    if (authUser) {
        STATE.authUser = authUser;
        //$('#welcomeuser').append(`Welcome, ${authUser.username}`);
    }
    //else {
    //console.log('no auth');
    //$('#default-menu').removeAttr('hidden');
    //}
}
//////////////////////

/*
if (authToken) {
    $.ajax({
            url: "/api/auth/refresh",
            type: "POST",
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`
            },
            contentType: "application/json"
        })
        .then(res => {
            STATE.token = res.authToken;
            localStorage.setItem("authToken", res.authToken);
            console.log('refresh');
        })
        .catch(err => {
            localStorage.setItem("authToken", "");
            //$("#landing").removeAttr("hidden");
        });
} else {
    console.log('no authtoken');
    //$("#landing").removeAttr("hidden");
}*/


function getAuthenticatedUserFromCache() {
    const authToken = localStorage.getItem('authToken');
    const user_id = localStorage.getItem('user_id');
    const username = localStorage.getItem('username');
    const email = localStorage.getItem('email');
    if (authToken) {
        return {
            authToken,
            user_id,
            username,
            email
        };
    } else {
        return undefined;
    }
}

function saveAuthenticatedUserIntoCache(user) {
    localStorage.setItem('authToken', user.authToken);
    localStorage.setItem('user_id', user.id);
    localStorage.setItem('username', user.username);
    localStorage.setItem('email', user.email);
}

function deleteAuthenticatedUserFromCache() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user_id');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
}



//-------------------------------------------------------------  PAGE LOAD

//  on page load do this
$(function () {
    updateAuthenticatedUI();
    bindEvents();
    if (STATE.authUser) {
        $('#main').prop('hidden', false);
        goToDashboard();
        renderNavigation();
    } else {
        renderIntro();
    }
});



//-------------------------------------------------------------  LOGIN

function login() {
    const username = $('#username').val();
    const password = $('#password').val();
    const newUser = {
        username: username,
        password: password
    };
    event.preventDefault();

    $.ajax({
        type: 'POST',
        url: '/api/auth/login/',
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify(newUser),
        success: res => {
            //localStorage.setItem('authToken', res.authToken);
            //localStorage.setItem('username', newUser.username);
            //localStorage.setItem('user_id', newUser.id);
            //localStorage.setItem('email', newUser.email);
            ////
            const authenticatedUser = res.user;
            authenticatedUser.authToken = res.authToken;
            saveAuthenticatedUserIntoCache(authenticatedUser);
            STATE.isLoggedIn = true;
            goToDashboard(authenticatedUser);
        }
    });
}


//-------------------------------------------------------------  LOGOUT

function logout() {
    deleteAuthenticatedUserFromCache();
    //localStorage.removeItem('authToken');
    //localStorage.removeItem('username');
    //  localStorage.removeItem('email');
    //localStorage.removeItem('user_id');
    STATE.isLoggedIn = false;
}

//-------------------------------------------------------------  SIGNUP


function signup() {
    const username = $('#username').val();
    const password = $('#password').val();
    const email = $('#email').val();
    const phone = $('#phone').val();
    const newUser = {
        username: username,
        password: password,
        email: email,
        phone: phone
    };
    $.ajax({
        type: 'POST',
        url: '/api/users/',
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify(newUser),
        success: res => {
            alert(`User ${newUser.username} created. Please login.`);
            renderLogin(res);
        },
        error: err => {
            //myMessage = res.JSON; //JSON.stringify(err.message);
            //console.log(err(response.JSON));
            //window.onerror;
            //console.error(message [, obj2, ..., objN]);
            alert('Unable to create new user, maybe try a different name');
            console.error(err);
        }
    });
    event.preventDefault();
}




//-------------------------------------------------------------  BINDINGS


function bindEvents() {
    $('#main').on('click', '#goToLoginBtn', (event) => {
        renderNavigation();
        renderLogin();
    });

    $('#main').on('submit', '#js-login-form', login);

    $('#main').on('submit', '#js-signup-form', signup);

    $('#main').on('click', '#goToSignupBtn', (event) => {
        renderNavigation();
        renderSignup();
    });

    $('#main').on('click', '#logoutBtn', (event) => {
        logout();
        renderLogin(); // renderIntro();
    });

    $('#main').on('click', '#renderDashboardBtn', goToDashboard);

    $('#main').on('click', '#viewGamesBtn', getAndDisplayGameEvents);

    $('#main').on('click', '#hostAGameBtn', renderHostAGame);

    $('#main').on('submit', '#js-create-form', addNewGameEvent);

    $('#main').on('click', '#goToEditGameBtn', (event) => {
        const gameEventId = $(event.currentTarget).closest('#game-summary').attr('data-game-id');
        getGameEvent(gameEventId, renderEditGame);
    });

    $('#main').on('submit', '#js-edit-form', (event) => {
        const gameEventId = $(event.currentTarget).attr('data-game-id');
        saveEditGame(gameEventId);
    });

    $('#main').on('click', '#deleteGameBtn', (event) => {
        const gameEventId = $(event.currentTarget).closest('#game-summary').attr('data-game-id');
        deleteGameEvent(gameEventId);
    });
}