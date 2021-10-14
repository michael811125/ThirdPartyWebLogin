//google 申請API的 client id
var googleClientID = '輸入自己的ClientID';

//自動引入Google SDK至html內
(function (d, s, id) {
    var js, gjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) { return; }
    js = d.createElement(s); js.id = id;
    js.src = "https://apis.google.com/js/platform.js";
    gjs.parentNode.insertBefore(js, gjs);
}(document, 'script', 'google-jssdk'));

//封裝google登入
function Google() {

    //取得Google已連線登入並同意授權後, response使用者資料.
    this.getResponse = function () {
        let responseJson = JSON.parse(localStorage.getItem("googleResponse"));
        return responseJson;
    }

    // Called when Google js API is loaded
    this.initGoogleAPI = function () {
        // Load "client" & "auth2" libraries
        gapi.load('client:auth2', {
            callback: function () {
                // Initialize client & auth libraries
                gapi.client.init({
                    clientId: googleClientID,
                    scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/plus.me'
                }).then(
                    function (success) {
                        // Google Libraries are initialized successfully
                        // You can now make API calls 
                        //if (loginWithGoogle != null) loginWithGoogle(cb);
                        if (CC_DEBUG) console.log("Google API is initialized successfully");
                    },
                    function (error) {
                        // Error occurred
                        console.log(error);// to find the reason 
                    }
                );
            },
            onerror: function () {
                // Failed to load libraries
                if (CC_DEBUG) console.log("Failed to load libraries");
            }
        });
    }

    // After Init Google js API Invoke loginWithGoogle() to Login
    this.loginWithGoogle = function () {
        // API call for Google login  
        gapi.auth2.getAuthInstance().signIn().then(
            function (response) {
                // Login API call is successful 
                Google.isLoginWithGoogle(response);
            },
            function (error) {
                // Error occurred
                // console.log(error) to find the reason
                if (CC_DEBUG) console.log(error);
            }
        );
    }

    //Google登入成功後可以透過API傳送資料至Server.
    Google.isLoginWithGoogle = function (response) {

        if (CC_DEBUG) console.log(response);

        alert("Google logged in successfully.");

        if (response.Ca !== undefined) {
            localStorage.setItem("googleResponse", JSON.stringify(response));
            //window.location = redirectURL;
            //傳送API至Server的地方
        }
    }
}

export { Google }