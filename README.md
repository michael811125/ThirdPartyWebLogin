# ThirdPartyWebLogin 封裝js

### SDK Include
- fb_login.js
- google_login.js

### Typescript(ts)使用方式
typescript 可以透過require的方式載入
```
import fbSDK = require("/Path/fb_login");
import googleSDK = require("Path/google_login");
```
```
let fb = new fbSDK.Facebook();
fb.loginWithFacebook();

let google = new googleSDK.Google();
google.initGoogleAPI();
google.loginWithGoogle();
```
---

### Javascript(js)使用方式
javascript 就直接引入使用就好, 或是html裡面遷入腳本也可
```
<script src="fb_login.js"></script>
<script src="google_login.js"></script>
```
```
import { fbSDK } from '/Path/fb_login.js';
import { googleSDK } from '/Path/google_login.js';
```
```
let fb = new fbSDK.Facebook();
fb.loginWithFacebook();

let google = new googleSDK.Google();
google.initGoogleAPI();
google.loginWithGoogle();
```

