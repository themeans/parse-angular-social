# packaged parse-angular-social-demo


## Install

You can install this package either with `npm` or with `bower`.

### npm

```shell
npm install parse-angular-social
```

Then require module "parse-angular-social" for your app:

```javascript
var parse_angular_social = require('parse-angular-social'),
	googleProvider = parse_angular_social.google,
	linkedinProvider = parse_angular_social.linkedin;
```

Then use this provider in route callback:

```javascript
	app.post('/auth/google', googleProvider);
	app.post('/auth/linkedin', linkedinProvider);
```

### bower

```shell
bower install parse-angular-social
```

Then add a `<script>` to your `index.html`:

```html
<script src="/bower_components/parse-angular-social/parse-angular-social.js"></script>
```

Then add `parseAngularSocial` as a dependency for your app:

```javascript
angular.module('myApp', ['parseAngularSocial']);
```
Then add 

```html
<facebook-login><facebook-login>
<google-login><google-login>
<linkedin-login><linkedin-login> 
```
in your html

## Documentation

## License

The MIT License
