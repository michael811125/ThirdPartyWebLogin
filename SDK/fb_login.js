//facebook 申請API的 client id
var fbClientID = '輸入自己的ClientID';
var redirectURL = '輸入登入成功後, 想要導向的URL';

//Initialize
window.fbAsyncInit = function () {
    FB.init({
        appId: fbClientID,
        cookie: true,
        xfbml: true,
        version: 'v9.0'
    });

    //可以記錄用戶行為資料, 可在後台查看用戶資訊, 自行決定是否呼叫.
    FB.AppEvents.logPageView();

    //手動登入輸入帳密後, 跳轉畫面回去Web時會在FB SDK初始的function裡再呼叫一次, 確認登入狀態.
    Facebook.checkLoginStatusManual();

    //FB是否取得連線, set連線狀態.
    Facebook.setStatus();

};

//自動引入Facebook SDK至html內 (Load the SDK asynchronously)
(function (d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) { return; }
    js = d.createElement(s); js.id = id;
    js.src = "https://connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));
//--------------------------------------------------------------

//--------------------------------------------------------------
//封裝facebook登入
function Facebook(isManual = false) {

    //constructor, 初始值.
    //new的時候可以輸入"manual"為手動登入, 預設空則自動登入.
    Facebook.isManual = (isManual ? true : false);

    //初始set FB連線狀態.
    Facebook.setStatus = function () {
        FB.getLoginStatus(function (response) {
            Facebook.status = response.status;
        });
    }

    //取得FB連線登入的狀態, 判斷是否有登入FB或已經登入FB, 僅針對FB是否有紀錄是登入狀態.
    this.getStatus = function () {
        return Facebook.status;
    }

    //取得FB已連線登入並同意授權後, response使用者資料.
    this.getResponse = function () {
        let responseJson = JSON.parse(localStorage.getItem("fbResponse"));
        return responseJson;
    }

    //透過FB SDK與FB進行授權與溝通的動作, 預設為[自動登入].
    this.loginWithFacebook = function () {

        //跳轉道FB輸入帳密前, 先記錄當前的URL.
        Facebook.setCurrentLocationURL();

        if (this.getStatus() === "connected") {
            //這部分是FB已經是有之前的登入狀態了, 直接取得資料做登入動作.

            //呼叫FB.api()取得使用者資料
            FB.api('/me', {
                fields: 'id, name, email, last_name, first_name, picture, gender'
            }, function (response) {
                //這邊的response就是FB回傳給你的資料.
                //再將回傳的資料送入API.
                Facebook.isLoginWithFacebook(response, cb);
            });

        }
        else {
            //這部分是FB未登入狀態, 跳轉FB輸入帳密畫面(手動跟FB.login方法).

            if (Facebook.isManual) {
                if (CC_DEBUG) console.log("手動登入...");
                Facebook.loginWithFacebookManual();
            }
            else {

                FB.login(function (response) {
                    if (CC_DEBUG) console.log("自動登入...");

                    //response.authResponse 判斷回傳是否有資料, 沒資料的話是為null.
                    if (response.authResponse) {
                        FB.api('/me', {
                            fields: 'id, name, email, last_name, first_name, picture, gender'
                        }, function (response) {
                            //這邊的response就是FB回傳給你的資料.
                            //再將回傳的資料送入API.
                            Facebook.isLoginWithFacebook(response);
                        });
                    }
                }, {
                    //FB.login()預設只會回傳基本的授權資料
                    //如果想取得額外的授權資料需要另外設定在scope參數裡面
                    scope: 'email, user_gender'
                });
            }
        }
    }

    //由於頁面跳轉原因會採取[手動登入], 例如: InAppBrowser等等...
    //像是Line通訊軟體, 因為是InAppBrowswer所以無法產生分頁, 導致登入畫面跳轉有問題, 所以可以採取[手動登入].
    Facebook.loginWithFacebookManual = function () {

        //定義手動登入基本要輸入的參數.
        let FbLogin = {
            oauthURL: 'https://m.facebook.com/v6.0/dialog/oauth',
            clientId: fbClientID,
            redirectURL: redirectURL,
            responseType: 'token',
            scope: 'email, user_gender'
        };

        let fbRedirectURL = FbLogin.oauthURL + '?client_id=' + FbLogin.clientId + '&redirect_uri=' + FbLogin.redirectURL + '&response_type=' + FbLogin.responseType + '&scope=' + FbLogin.scope;

        //手動跳轉到Facebook輸入帳密頁面, 請求使用者同意.
        window.location = fbRedirectURL;
    }

    //進行[手動登入]後, 取得FB授權跳轉畫面完成時URL會嵌入FB使用者授權的token等,
    //再判斷使用者同意授權的token進行Web的登入動作.
    Facebook.checkLoginStatusManual = function () {

        //手動登入輸入FB帳密後, 跳轉回Web網頁時, URL裡會帶入FB給的token等參數資料.
        //透過這樣的方式去判斷是否已經授權並以FB登入, 確定登入再去GET FB.api(me)取得資料送入api_fb_login.php.
        if (location.href.indexOf('#access_token') !== -1) {
            FB.getLoginStatus(function (response) {
                if (response.status === "connected") {
                    //呼叫FB.api()取得使用者資料
                    FB.api('/me', {
                        fields: 'id, name, email, last_name, first_name, picture, gender'
                    }, function (response) {
                        //這邊的response就是FB回傳給你的資料.
                        //再將回傳的資料送入API.	
                        Facebook.isLoginWithFacebook(response);
                    });
                }
            });
        }
    }

    //FB登入成功後可以透過API傳送資料至Server.
    Facebook.isLoginWithFacebook = function (response) {

        if (CC_DEBUG) console.log(response);

        //非同步(Asynchronous), 先通知使用者登入成功, 這段期間也會送資料到API.
        alert("Facebook logged in successfully.");

        if (response.email !== undefined) {
			localStorage.setItem("fbResponse", JSON.stringify(response));
            //window.location = redirectURL;
            //傳送API至Server的地方
        }
    }

    //FB登入跳轉畫面完成後, 可以呼叫reloadPage()進行重載.
    Facebook.reloadPage = function () {
        //有些按鈕href導向還沒確認, 所以是以href='#'這樣標記.
        //這樣按按鈕時會導致URL後方多加一個#, 使畫面跳轉導向不了, 才將#重新replace為空字串.
        let current_page = localStorage.getItem("current_page");
        window.location = current_page.replace('#', '');
        //window.location = (Facebook.getCookie("current_page")).replace('#', '');
    }

    //跳轉到FB輸入帳密前, 先set 當前的URL, 待後面使用.
    Facebook.setCurrentLocationURL = function () {
        let cookieName = "current_page";
        let currentURL = location.href;

        localStorage.setItem(cookieName, currentURL);
        //Facebook.setCookie(cookieName, currentURL);
    }

    Facebook.setCookie = function (cookieName, data) {
        document.cookie = cookieName + '=' + data;
    }

    Facebook.getCookie = function (name) {
        let v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
        //console.log(v);

        return v ? v[2] : null;
    }
}
//--------------------------------------------------------------

export { Facebook };