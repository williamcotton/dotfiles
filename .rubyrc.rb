# my_library.rb
module LoadEnv
  if ENV['RUBYPATH']
    ENV['RUBYPATH'].split(':').each do |dir|
      $LOAD_PATH.unshift(dir)
    end
  end
end
