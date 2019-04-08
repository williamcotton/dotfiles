# Load ~/.extra, ~/.bash_prompt, ~/.exports, ~/.aliases, ~/.functions and ~/.git-completion
# ~/.extra can be used for settings you don’t want to commit
for file in ~/dotfile/.{extra,bash_prompt,exports,aliases,functions,git-completion}; do
	[ -r "$file" ] && source "$file"
done
unset file

for file in ~/dotfile/.{gitconfig,gemrc}; do
  cp "$file" ~/
done
unset file

# Case-insensitive globbing (used in pathname expansion)
shopt -s nocaseglob

# append to history, don't overwrite it
shopt -s histappend                      

# Save and reload the history after each command finishes
export PROMPT_COMMAND="history -a; history -c; history -r; $PROMPT_COMMAND"

# Autocorrect typos in path names when using `cd`
shopt -s cdspell

# Prefer US English and use UTF-8
export LC_ALL="en_US.UTF-8"
export LANG="en_US"

# Add tab completion for SSH hostnames based on ~/.ssh/config, ignoring wildcards
[ -e "$HOME/.ssh/config" ] && complete -o "default" -o "nospace" -W "$(grep "^Host" ~/.ssh/config | grep -v "[?*]" | cut -d " " -f2)" scp sftp ssh

# Add tab completion for `defaults read|write NSGlobalDomain`
# You could just use `-g` instead, but I like being explicit
complete -W "NSGlobalDomain" defaults

# Add `killall` tab completion for common apps
complete -o "nospace" -W "Finder Dock Mail Safari iTunes iCal Address\ Book SystemUIServer" killall

# Load SCM Breeze
[ -s "$HOME/.scm_breeze/scm_breeze.sh" ] && source "$HOME/.scm_breeze/scm_breeze.sh"

# Load NVM
# export NVM_DIR="$HOME/.nvm"
#   . "$(brew --prefix nvm)/nvm.sh"

# Load rbenv
# eval "$(rbenv init - --no-rehash)"

# Load AVN
# [[ -s "$HOME/.avn/bin/avn.sh" ]] && source "$HOME/.avn/bin/avn.sh" # load avn

# Load RVM function
# [[ -s "$HOME/.rvm/scripts/rvm" ]] && . "$HOME/.rvm/scripts/rvm"

# Load asdf
. $(brew --prefix asdf)/asdf.sh

# copelco@montgomery:~$ sudo sysctl -w kern.sysv.shmmax=1073741824
# kern.sysv.shmmax: 4194304 -> 1073741824
# copelco@montgomery:~$ sudo sysctl -w kern.sysv.shmall=1073741824
# kern.sysv.shmall: 1024 -> 1073741824

# We want Ctrl+s to work for BASH search
stty -ixon
