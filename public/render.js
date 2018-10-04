//------------------------------------------------------------- RENDER INTRO HOME PAGE

function renderIntro() {
    let toRender = `
    <div class="row" role="banner">
        <div class="column left">
            <img src="images/starttiles.svg" class="tiles" alt="picture of game tiles"/>
        </div>
        <div class="intro center column middle">
            <img src="images/img1.svg" class="imgIntro" alt="picture of flinging dice onto boardgame">
            <h1 class="redColor center fontPermMarker">LET'S ROLL</h1>
            <h3 class="blueColor center fontJosefinSans">TABLETOP SCHEDULER</h3>
            <p>Play more board games (or anything else) with Let's Roll tabletop scheduler! Currently you can view games and host a game session. Eventually I would like to add the ability to sign up to attend other
                users games, add comments, and connect to the board game geek api to grab more info on the games you
                would like to play, as well as improve the CSS to match the mockups better.</p>
            <p>
                <button class="homebuttons" id="goToLoginBtn">LOG IN > </button>
                &nbsp;&nbsp;<span class="blueColor btnslash">|</span>
                &nbsp;&nbsp;
                <button class="homebuttons" id="goToSignupBtn">SIGN UP > </button>
            </p>
        </div>
        <div class="column right">
            <img src="images/finishtiles.svg" class="tiles" alt="picture of game tiles"/>
        </div>
    </div>`;
    $('#main').html(toRender);
}

//------------------------------------------------------------- RENDER LOGIN

function renderLogin() {
    let toRender = `
        <form id="js-login-form" role="login">
            <fieldset>
                <legend>Log In</legend>
                <label for="username">User Name</label><br/>
                <input type="text" id="username" name="username" placeholder="Enter your username here" required><br /><br/>
                <label for="password">Password</label><br/>
                <input class="blueborder" type="text" id="password" name="password" placeholder="Enter your password here" required><br />
                <button type="submit" id="logInBtn" class="button">Log In > </button><br/><br/>
                <button class="smallBtn" id="goToSignupBtn">Or Sign Up Here > </button>
            </fieldset>
        </form>
        <img src="images/dice.svg" class="dice" alt="picture of dice"/>
    `;
    $('#main').html(toRender);
}

//------------------------------------------------------------- SIGNUP

function renderSignup() {
    let toRender = `
        <form id="js-signup-form" role="signup">
            <fieldset>
                <legend>Sign Up</legend>
                <label for="username">User Name</label><br/>
                <input type="text" id="username" name="username" placeholder="Enter your username here" required><br />
                <label for="password">Password</label><br/>
                <input class="blueborder" type="text" id="password" name="password" placeholder="Enter your password here" required><br />
                <label for="email">Email</label><br/>
                <input type="text" id="email" name="email" placeholder="Enter your email here" ><br />
                <label for="phone">Phone</label><br/>
                <input class="blueborder" type="text" id="phone" name="phone" placeholder="Enter your phone here" required><br />
                <button type="submit" id="submitSignUpUserBtn" class="button">Sign Up ></button><br/><br/>
                <button class="smallBtn" id="goToLoginBtn">Or Log in Here > </button>
            </fieldset>
        </form>
        <img src="images/dice.svg" class="dice" alt="picture of dice"/>
    `;
    $('#main').html(toRender);
}


//------------------------------------------------------------- RENDER DASHBOARD

function renderDashboard(user) {
    let toRender = `
    <h1 class="legend" id="welcomeuser">Welcome ${user}</h1>
    <div>
        <div class="inline">
            <button id="viewGamesBtn" class="dashButton redBackColor">View Games > </button>
        </div>
        <div class="inline">
            <img src="images/gameshelf.svg" id="gameshelf" alt="picture of guy looking at game shelf" />
        </div>
    </div></div>
    <div class="row2">
    <div class="inline">
            <img src="images/dmbook.svg" class="inline" alt="picture of guy holding dm screen"/>
        </div>
        <div class="inline">
            <button id="hostAGameBtn" class="dashButton blue hostAGameBtn">Host a Game > </button>
        </div>
    </div></div>
    `;
    $('#main').html(toRender);
}

//------------------------------------------------------------- RENDER NAVIGATION

function renderNavigation() {
    let toRender = `
        <div id="dashTop" class="fontPermMarker">&nbsp;LET'S ROLL!</div>
        <button id="hostAGameBtn" class="navBtns">Host A Game</button> | <button id="viewGamesBtn" class="navBtns">View Games</button> | <button id="logoutBtn" class="navBtns">LOGOUT</button>
    `;
    $('#nav').html(toRender);
}

//------------------------------------------------------------- RENDER VIEW GAMES

function renderViewGames(gameEvents) {

    let top = `

            <h1 class="legend">View Games</h1>
            <div class="cards">`;

    let bottom = '</div>';

    let gamesHtml = gameEvents.map(gamesToHtml).join('<hr/>');

    let htmlfinal = top + gamesHtml + bottom;


    function gamesToHtml(gameEvent) {
        let userOnlyButtons = '';
        if (gameEvent.user.id === STATE.authUser.user_id) {
            userOnlyButtons = `<button type="button" id="goToEditGameBtn" class="button">Edit Game</button>
                        <button type="button"  id="deleteGameBtn">Delete Game</button>`;
        }
        let gameHTML = `
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
                      <div id="userButtons">${userOnlyButtons}
                        </div>
                    </div>
                </div>
                    `;

        return gameHTML;
    }

    $('#main').html(htmlfinal);

    makeCollapsible();
}


//------------------------------------------------------------- MAKE COLLAPSIBLE LIST
//makes the viewing games expand/collapse to show more info
function makeCollapsible() {
    var acc = document.getElementsByClassName('accordion');
    var i;

    for (i = 0; i < acc.length; i++) {
        acc[i].addEventListener('click', function () {
            this.classList.toggle('active');
            var panel = this.nextElementSibling;
            if (panel.style.maxHeight) {
                panel.style.maxHeight = null;
            } else {
                panel.style.maxHeight = panel.scrollHeight + 'px';
            }
        });
    }
}


//------------------------------------------------------------- RENDER CREATE - HOST A GAME

function renderHostAGame() {
    let toRender = `
        <form id="js-create-form" role="create">
            <fieldset>
                <legend>Host a Game</legend>

                <label for="gameTitle">Game Title</label><br/>
                <input class="blueborder" type="text" id="gameTitle" name="gameTitle" placeholder="Monopoly" required><br />

                <label for="maxPlayers">Maximum Players</label><br/>
                <input type="number" id="maxPlayers" name="maxPlayers" placeholder="6" required><br />

                <label for="address">Address</label><br/>
                <input class="blueborder" type="address" id="address" name="address" placeholder="123 Main St" required><br />

                <label for="gameDateTime">Date</label><br/>
                <input type="datetime-local" id="gameDateTime" name="gameDateTime" required><br />

                <label for="gameInfo">Additional Info</label><br/>
                <input class="blueborder" type="textarea" rows="50" cols="33" maxlength="200" id="gameInfo" name="gameInfo" placeholder="Description of event or additional details about what to bring or whether food will be provided"><br />

                <button type="submit" id="createBtn" class="button">Create Game > </button>
            </fieldset>
        </form>
    `;
    $('#main').html(toRender);
}



//------------------------------------------------------------- RENDER EDIT

function renderEditGame(game) {
    const date = new Date(game.gameDateTime);
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    if (month < 10) {
        month = `0${month}`;
    }
    let day = date.getDate();
    if (day < 10) {
        day = `0${day}`;
    }
    let hours = date.getHours();
    if (hours < 10) {
        hours = `0${hours}`;
    }
    let minutes = date.getMinutes();
    if (minutes < 10) {
        minutes = `0${minutes}`;
    }
    let formattedDate = `${year}-${month}-${day}T${hours}:${minutes}`;


    let toRender = `
        <form id="js-edit-form" role="create" data-game-id="${game.id}">
            <fieldset>
                <legend>Edit Your Game</legend>

                <label for="gameTitle">Game Title</label><br/>
                <input class="blueborder" type="text" id="gameTitle" name="gameTitle" value="${game.gameTitle}" required><br/>

                <label for="maxPlayers">Maximum Players</label><br/>
                <input type="number" id="maxPlayers" name="maxPlayers" value="${game.maxPlayers}" required><br />

                <label for="address">Street</label><br/>
                <input class="blueborder" type="address" id="address" name="address" value="${game.address}" required><br />

                <label for="gameDateTime">Date & Time</label>
                <input type="datetime-local" id="gameDateTime" name="gameDateTime" value="${formattedDate}" required><br />

                <label for="gameInfo">Additional Info</label><br/>
                <input class="blueborder" type="textarea" id="gameInfo" name="gameInfo" value="${game.gameInfo}"><br />

                <button type="submit" id="saveEditGameBtn" class="button">Save Game > </button>
            </fieldset>
        </form>
    `;
    $('#main').html(toRender);
}