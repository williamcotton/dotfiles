# Load ~/.extra, ~/.bash_prompt, ~/.exports, ~/.aliases, ~/.functions and ~/.git-completion
# ~/.extra can be used for settings you don’t want to commit
for file in ~/dotfiles/.{extra,bash_prompt,exports,aliases,functions,git-completion}; do
	[ -r "$file" ] && source "$file"
done
unset file

for file in ~/dotfiles/.{gitconfig,gemrc}; do
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
! [ -s "$HOME/.scm_breeze/scm_breeze.sh" ] && git clone git://github.com/scmbreeze/scm_breeze.git "$HOME/.scm_breeze"
[ -s "$HOME/.scm_breeze/scm_breeze.sh" ] && source "$HOME/.scm_breeze/scm_breeze.sh"

# Load asdf
if which brew; then 
  . $(brew --prefix asdf)/asdf.sh; 
fi;

# We want Ctrl+s to work for BASH search
stty -ixon
