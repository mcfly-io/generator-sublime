#!/bin/bash

# constants
NODE_VERSION="<%=options.nodeVersion%>";
TRAVIS_VERSION="1.7.1"

clear

CURRENT_DIRECTORY=$(pwd)

<% if (Gitconfig) { %>
# configure git
bash ./deploy/git-config.sh
<% }%>

# install node
source ~/.nvm/nvm.sh
nvm install $NODE_VERSION
nvm use $NODE_VERSION
node --version

# install and configure zsh
curl -L http://install.ohmyz.sh | sh
cd ~/.oh-my-zsh/custom/plugins
git clone git://github.com/zsh-users/zsh-syntax-highlighting.git
cd $CURRENT_DIRECTORY
# forces terminal to use zsh
echo "zsh && exit 0" >> ~/.bash_profile

# install travis
gem install travis -v $TRAVIS_VERSION --no-rdoc --no-ri

