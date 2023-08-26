# williamc
RUN apt-get install -y ruby zsh
RUN sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
RUN echo ". $HOME/dotfiles/.zshrc" > $HOME/.zshrc
