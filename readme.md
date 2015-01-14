# Introduction

This is a Titanium Mobile App Template. You need some tools to get an app scaffold, which will be described next.

# Installation

- Install **Ruby** on your machine (windows only)

- Install **Node.js** with **NPM** on your machine

- Install **gulp CLI** (globally) on your machine <code>npm install gulp -g</code>

- Install **bundler** (Ruby Package manager) on your machine <code>gem install bundler</code>

- Checkout files from Repo into your project directory

- Change to project directory and install required gems (from Gemfile) <code>bundle install</code>

- Run required node packages from project directory <code>npm install</code>

- Install required Titanium Mobile modules from project directory (modules are read from **tiapp.xml**) <code>gittio install</code>

# Usage
## Initiation

- Run gulp task to init app scaffold. <code>gulp init</code>

- Install javascript modules via bower <code>bower install *NAME* --save[-dev]</code>

- Install node modules via npm <code>npm install *NAME* --save[-dev]</code>

## Development

- Run gulp task to empty dist folder <code>gulp clean:dist</code>
- Hide and show debug outputs per gulp task <code>gulp debug:hide / gulp debug:show</code>
	
## Deployment

- Run gulp to upload to installr and clean dist folder. Installr configuration can be found at **installrfile.json** file. <code>gulp installr</code>
	
- Or upload only a build to installr with gulp <code>gulp installr:upload</code>