require 'redis'
require 'json'
require 'irb/completion'
require 'irb/ext/save-history'

REDIS = Redis.new(:host => "localhost", :port => 6379)

# History with readline
IRB.conf[:AUTO_INDENT]  = true
IRB.conf[:USE_READLINE] = true
IRB.conf[:SAVE_HISTORY] = 1000
IRB.conf[:HISTORY_FILE] = "#{ENV['HOME']}/.irb_history"

rvm_ruby_string = ENV["rvm_ruby_string"] || "#{RUBY_ENGINE rescue 'ruby'}-#{RUBY_VERSION}-#{(RUBY_PATCHLEVEL) ? "p#{RUBY_PATCHLEVEL}" : "r#{RUBY_REVISION}"}"

# colorize prompt
IRB.conf[:PROMPT][:DOTFILES] = {
  # Do not use coloring for prompts because of weird bug in cursor positioning in IRB.
  # \001 and \002 are special characters prcessed by readline, so the substring between them
  # will not be counted in prompt length calculation.
  # http://www.tek-tips.com/viewthread.cfm?qid=1560209&page=20
  :PROMPT_I => "\001\e[90m\002#{rvm_ruby_string}\001\e[0m\002\001\e[0;36m\002 >> \001\e[0m\002",
  :PROMPT_S => "\001\e[90m\002#{rvm_ruby_string}\001\e[0m\002\001\e[0;32m\002%l>> \001\e[0m\002",
  :PROMPT_C => "\001\e[90m\002#{rvm_ruby_string}\001\e[0m\002\001\e[0;36m\002 .. \001\e[0m\002",
  :PROMPT_N => "\001\e[90m\002#{rvm_ruby_string}\001\e[0m\002\001\e[0;36m\002?.. \001\e[0m\002",
  :RETURN   => "\e[1;31m\342\206\222\e[0m %s\n"
}
# Mac OS X uses editline instead of readline by default. It does not support invisible
# chars guards, so there will be positioning problems in IRB console. Strip invisible chars
# now.
#
# If you want to get a full-featured IRB console, recompile your ruby with normal readline:
#     rvm install ree -C --with-readline-dir=/opt/homebrew/Cellar/readline/6.0
#
# BTW, editline does not support UTF8...
if Readline::VERSION == 'EditLine wrapper'
  puts "\e[31mWARNING\e[0m: You ruby built with \e[35meditline\e[0m, instead of \e[35mreadline\e[0m, so it does not support" +
    "Unicode and ANSI chars in prompt.\n" +
    "Please re-build your Ruby with readline support (see http://bit.ly/dxQmvQ for details):
    \e[90mrvm install ree -C --with-readline-dir=/opt/homebrew/Cellar/readline/6.0\e[0m"
  IRB.conf[:PROMPT][:DOTFILES].each do |k, v|
    IRB.conf[:PROMPT][:DOTFILES][k] = v.gsub(%r{\001[^\002]*\002}, '')
  end
end
IRB.conf[:PROMPT_MODE] = :DOTFILES

# pretty print
require 'pp'

# awesome print
# begin
#   require 'ap'
# 
#   IRB::Irb.class_eval do
#     def output_value
#       puts IRB.conf[:PROMPT][:DOTFILES][:RETURN] % @context.last_value.ai
#     end
#   end
# rescue LoadError
#   puts 'AwesomePrint gem not available: `gem install awesome_print`'
# end

# Looksee gem
begin
  require 'looksee'
rescue LoadError
  puts 'Looksee gem not available: `gem install looksee`'
end

# Easily print methods local to an object's class
module ObjectLocalMethods
  def local_methods(include_superclasses = true)
    (self.methods - (include_superclasses ? Object.methods : obj.class.superclass.instance_methods)).sort
  end
end
Object.send(:extend,  ObjectLocalMethods)
Object.send(:include, ObjectLocalMethods)

module Kernel
  def copy(str)
    IO.popen('pbcopy', 'w') { |f| f << str.to_s }
    str
  end

  def paste
    `pbpaste`
  end

  def copy_history
    history = Readline::HISTORY.entries
    index = history.rindex("exit") || -1
    content = history[(index + 1)..-2].join("\n")
    puts content
    copy content
  end
end

# 1.find_method {|x| x.unknown == 2 } (gem install methodfinder)
begin
  require 'methodfinder'
rescue LoadError
end

# http://gist.github.com/124272
# def copy(str)
#   IO.popen('xclip -i', 'w') { |f| f << str.to_s }
# end
# 
# def paste
#   `xclip -o`
# end

# http://ozmm.org/posts/time_in_irb.html
def time(times = 1)
  require 'benchmark'
  ret = nil
  Benchmark.bm { |x| x.report { times.times { ret = yield } } }
  ret
end

# http://github.com/rtomayko/dotfiles/blob/rtomayko/.irbrc
# list object methods
# def local_methods(obj=self)
#   (obj.methods - obj.class.superclass.instance_methods).sort
# end

def ls(obj=self)
  width = `stty size 2>/dev/null`.split(/\s+/, 2).last.to_i
  width = 80 if width == 0
  local_methods(obj).each_slice(3) do |meths|
    pattern = "%-#{width / 3}s" * meths.length
    puts pattern % meths
  end
end

# Just for Rails3
if defined?(ActiveSupport::Notifications)

  $odd_or_even_queries = false
  ActiveSupport::Notifications.subscribe('sql.active_record') do |*args|
    $odd_or_even_queries = !$odd_or_even_queries
    color = $odd_or_even_queries ? "\e[36m" : "\e[35m"
    event = ActiveSupport::Notifications::Event.new(*args)
    time = "%.1fms" % event.duration
    name = event.payload[:name]
    sql = event.payload[:sql].gsub("\n", " ").squeeze(" ")
    puts " \e[1m#{color}#{name} (#{time})\e[0m #{sql}"
  end

  include Rails.application.routes.url_helpers
  default_url_options[:host] = Rails.application.class.parent_name.downcase

# And for Rails2
elsif ENV.include?('RAILS_ENV') && !Object.const_defined?('RAILS_DEFAULT_LOGGER')

  require 'logger'
  RAILS_DEFAULT_LOGGER = Logger.new(STDOUT)
end