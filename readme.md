# Introduction

This is a Titanium Mobile App Template. You need some tools to get an app scaffold, which will be described next.

 <p>&nbsp;</p>

# Installation

- Install **Ruby** on your machine (only windows)

- Install **Node.js** with **NPM** on your machine

- Install **gulp CLI** (globally) on your machine
	<pre><code>npm install gulp -g</code></pre>

- Install **bundler** (Ruby Package manager) on your machine
	<pre><code>gem install bundler</code></pre>

- Checkout files from Repo into your project directory

- Change to project directory and install required gems (from Gemfile)
	<pre><code>bundle install</code></pre>

- Run required node packages from project directory
	<pre><code>npm install</code></pre>

- Install required Titanium Mobile modules from project directory (modules are read from **tiapp.xml**)
	<pre><code>gittio install</code></pre>

<p>&nbsp;</p>

# Usage
## Initiation

- Run Gulp Task "**init**" to get files from **Bower** and let them be copied to the right place.
	<pre><code>gulp init</code></pre>

- Install javascript modules via **bower**
	<pre><code>bower install *NAME* --save[-dev]</code></pre>

- Search node modules via **npm**
	<pre><code>npm  search *NAME*</code></pre>

- Install node modules via **npm**
	<pre><code>npm install *NAME* --save[-dev]</code></pre>

<p>&nbsp;</p>

## Development

- Run Gulp Task "**ti:build**" to start simulator
	<pre><code>gulp ti:build</code></pre>

- Run Gulp Task "**ti:clean**" to clean build folder/project
	<pre><code>gulp ti:clean</code></pre>
	
<p>&nbsp;</p>

## Deployment

- Run Gulp Task "**installer**" to build and upload to installer. Installr configuration can be found at **installrconfig.json** file.
	<pre><code>gulp init</code></pre>
	
- Also it is possible to run Gulp Task "**installr:build**" to only build .ipa or .apk file. 
	<pre><code>gulp installr:build</code></pre>
	
- Or upload a build directly to installr with the Gulp Task "**installr:upload**".	<pre><code>gulp installr:upload</code></pre>