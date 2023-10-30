function plt<PltPrograms extends string>(
  pltProgram: PltPrograms extends "" ? never : PltPrograms
): Plt<PltPrograms> {
  return null as any;
}

// ------------------------------ plt types ------------------------------

type Plt<PltPrograms extends string> =
  PltPrograms extends `${infer ProgramFields} {${infer ProgramAction}}${infer Rest}`
    ? [
        PltCommand<`${ProgramFields} {${ProgramAction}}`>,
        ...Plt<StripLeadingAndTrailingWhitespace<Rest>>
      ]
    : [PltCommand<PltPrograms>];

type PltCommand<PltProgram extends string> =
  StripLeadingAndTrailingWhitespace<PltProgram> extends `[${infer Ys}]${infer RestWhitespace},${infer X}{${infer PltA}}`
    ? {
        fields_title: FlattenSplitByCommaAsString<Ys>;
        y_fieldnames: FlattenSplitByComma<Ys>;
        x_fieldname: StripLeadingAndTrailingWhitespace<X>;
        multi: true;
      } & PltAction<StripLeadingAndTrailingWhitespace<PltA>>
    : PltProgram extends `${infer Y},${infer X}{${infer PltA}}`
    ? {
        y_fieldname: StripLeadingAndTrailingWhitespace<Y>;
        x_fieldname: StripLeadingAndTrailingWhitespace<X>;
        multi: false;
      } & PltAction<StripLeadingAndTrailingWhitespace<PltA>>
    : never;

type PltAction<PltSpec> = PltSpec extends `${infer PltT} ${infer PltO}`
  ? {
      plot_type: StripLeadingAndTrailingWhitespace<PltPlotType<PltT>>;
    } & PltOptions<StripLeadingAndTrailingWhitespace<PltT>, PltO>
  : never;

type PltOptions<PltT, PltOpt> = PltT extends "plot" | "bar" | "stackbar"
  ? PltOpt extends `${infer PltWidth}px${infer RestWhitespace}[${infer PltO}]`
    ? {
        width: ParseInt<PltWidth>;
        options: SplitByCommaSpace<PltO>;
      }
    : PltOpt extends `${infer PltWidth}px${Whitespace}${infer PltStyle} ${infer PltColor}`
    ? {
        width: ParseInt<PltWidth>;
        draw_style: PltStyle;
        color: PltColor;
      }
    : never
  : PltT extends "highlight"
  ? PltOpt extends `${infer PltO}`
    ? HighlightAttributes<StripLeadingAndTrailingAndInternalWhitespace<PltO>>
    : never
  : PltOpt extends `${infer GlobalOpt}[${infer PltO}]`
  ? {
      global_options: FlattenSplitByCommaSpace<
        StripLeadingAndTrailingAndInternalWhitespace<GlobalOpt>
      >;
      attributes: SplitByCommaSpace<PltO>;
    }
  : PltOpt extends `${infer PltO}`
  ? {
      attributes: FlattenSplitByCommaSpace<PltO>;
    }
  : never;

type HighlightAttributes<PltOpts> =
  PltOpts extends `${infer PltStart} ${infer PltEnd} ${infer PltStyle} ${infer PltColor}`
    ? {
        start: PltStart;
        end: PltEnd;
        draw_style: PltStyle;
        color: PltColor;
      }
    : never;

type PltPlotType<PltT> = PltT;

// ------------------------------ plt support types ------------------------------

// "a, b" => [a, b]
// "a, b, c" => [a, b, c]
// "a,b,c" => [a, b, c]
type SplitByComma<S> = S extends `${infer A}, ${infer B}`
  ? [A, ...SplitByComma<B>]
  : S extends `${infer A}`
  ? [A]
  : never;

const splitByCommaTest1: SplitByComma<"a, b"> = ["a", "b"];
const splitByCommaTest2: SplitByComma<"a, b, c"> = ["a", "b", "c"];

// "a, b" => [a, b]
// "a,b,c" => [a, b, c]
// "a,b" => [a, b]
// "a, b, c" => [a, b, c]
type FlattenSplitByComma<S> = S extends `${infer A},${infer B}`
  ? [
      StripLeadingAndTrailingAndInternalWhitespace<A>,
      ...FlattenSplitByComma<StripLeadingAndTrailingAndInternalWhitespace<B>>
    ]
  : S extends `${infer A}`
  ? [StripLeadingAndTrailingAndInternalWhitespace<A>]
  : never;

const flattenSplitByCommaTest1: FlattenSplitByComma<"a, b"> = ["a", "b"];
const flattenSplitByCommaTest2: FlattenSplitByComma<"a,b,c"> = ["a", "b", "c"];
const flattenSplitByCommaTest3: FlattenSplitByComma<"a,b"> = ["a", "b"];
const flattenSplitByCommaTest4: FlattenSplitByComma<"a, b, c"> = [
  "a",
  "b",
  "c",
];

type FlattenSplitByCommaAsString<S> = S extends `${infer A},${infer B}`
  ? `${StripLeadingAndTrailingAndInternalWhitespace<A>},${FlattenSplitByCommaAsString<
      StripLeadingAndTrailingAndInternalWhitespace<B>
    >}`
  : S extends `${infer A}`
  ? StripLeadingAndTrailingAndInternalWhitespace<A>
  : never;

// "a b" => [a, b]
// "a b c" => [a, b, c]
type SplitBySpace<S> = S extends `${infer A} ${infer B}`
  ? [A, ...SplitBySpace<B>]
  : S extends `${infer A}`
  ? [A]
  : never;

const splitBySpaceTest1: SplitBySpace<"a b"> = ["a", "b"];
const splitBySpaceTest2: SplitBySpace<"a b c"> = ["a", "b", "c"];

// "a b, c d" => [[a, b], [c, d]]
// "a b, c d, e f" => [[a, b], [c, d], [e, f]]
type SplitByCommaSpace<S> = S extends `${infer A},${infer B}`
  ? [
      [...SplitBySpace<StripLeadingAndTrailingAndInternalWhitespace<A>>],
      ...SplitByCommaSpace<StripLeadingAndTrailingAndInternalWhitespace<B>>
    ]
  : S extends `${infer A}`
  ? [[...SplitBySpace<StripLeadingAndTrailingAndInternalWhitespace<A>>]]
  : never;

const splitByCommaSpaceTest1: SplitByCommaSpace<"a b, c d"> = [
  ["a", "b"],
  ["c", "d"],
];
const splitByCommaSpaceTest2: SplitByCommaSpace<"a b, c d, e f"> = [
  ["a", "b"],
  ["c", "d"],
  ["e", "f"],
];

const splitByCommaSpaceTest3: SplitByCommaSpace<"    a b, c d, e f, g h     "> =
  [
    ["a", "b"],
    ["c", "d"],
    ["e", "f"],
    ["g", "h"],
  ];

const splitByCommaSpaceTest4: SplitByCommaSpace<"    a    b   ,      c    d   ,        e       f      ,         g       h     "> =
  [
    ["a", "b"],
    ["c", "d"],
    ["e", "f"],
    ["g", "h"],
  ];

const splitByCommaSpaceTest5: SplitByCommaSpace<"    a    b   \n,      c    d   \n,        e       f      \n,         g       h     \n,     i    j   "> =
  [
    ["a", "b"],
    ["c", "d"],
    ["e", "f"],
    ["g", "h"],
    ["i", "j"],
  ];

// "a b, c d" => [[a, b], [c, d]]
// "a b, c d, e f" => [[a, b], [c, d], [e, f]]
type FlattenSplitByCommaSpace<S> = S extends `${infer A}, ${infer B}`
  ? [[...SplitBySpace<A>], ...SplitByCommaSpace<B>]
  : S extends `${infer A}`
  ? [...SplitBySpace<A>]
  : never;

const flattenSplitByCommaSpaceTest1: FlattenSplitByCommaSpace<"a b, c d"> = [
  ["a", "b"],
  ["c", "d"],
];
const flattenSplitByCommaSpaceTest2: FlattenSplitByCommaSpace<"a b, c d, e f"> =
  [
    ["a", "b"],
    ["c", "d"],
    ["e", "f"],
  ];

type IgnoredCharacters = "\t" | "\n" | "\r";

type Whitespace = " " | IgnoredCharacters;

type StripWhitespace<S extends string> =
  S extends `${infer L}${Whitespace}${infer R}`
    ? StripWhitespace<`${L}${R}`>
    : S extends `${Whitespace}${infer T}`
    ? StripWhitespace<T>
    : S extends `${infer T}${Whitespace}`
    ? StripWhitespace<T>
    : S;

const stripWhitespaceTest1: StripWhitespace<"  a  "> = "a";
const stripWhitespaceTest2: StripWhitespace<"  a  b   "> = "ab";
const stripWhitespaceTest3: StripWhitespace<"  a  b   c  "> = "abc";

type StripLeadingWhitespace<S extends string> =
  S extends `${Whitespace}${infer T}` ? StripLeadingWhitespace<T> : S;

type StripTrailingWhitespace<S extends string> =
  S extends `${infer T}${Whitespace}` ? StripTrailingWhitespace<T> : S;

type StripLeadingAndTrailingWhitespace<S extends string> =
  StripTrailingWhitespace<StripLeadingWhitespace<S>>;

const stripLeadingAndTrailingWhitespaceTest1: StripLeadingAndTrailingWhitespace<"  a  "> =
  "a";

const stripLeadingAndTrailingWhitespaceTest2: StripLeadingAndTrailingWhitespace<"  a  b   "> =
  "a  b";

// "a     b" => "a b"
// "a     \nb" => "a b"
type StripInternalMultipleWhitespace<S extends string> =
  S extends `${infer L}  ${infer R}` // two or more spaces
    ? StripInternalMultipleWhitespace<`${L} ${R}`>
    : S extends `${infer L}${IgnoredCharacters}${IgnoredCharacters}${infer R}` // two or more newline characters
    ? StripInternalMultipleWhitespace<`${L}\n${R}`>
    : S extends `${infer L} ${IgnoredCharacters}${infer R}` // space followed by a newline
    ? StripInternalMultipleWhitespace<`${L} ${R}`>
    : S extends `${infer L}${IgnoredCharacters} ${infer R}` // newline followed by a space
    ? StripInternalMultipleWhitespace<`${L} ${R}`>
    : S;

const stripInternalMultipleWhitespaceTest1: StripInternalMultipleWhitespace<"a    b"> =
  "a b";
const stripInternalMultipleWhitespaceTest2: StripInternalMultipleWhitespace<"a    \nb"> =
  "a b";

// "    a    b   " => "a b"
// "    a    b   c  " => "a b c"
// "a    \nb" => "a b"
type StripLeadingAndTrailingAndInternalWhitespace<S extends string> =
  StripInternalMultipleWhitespace<StripLeadingAndTrailingWhitespace<S>>;

const stripLeadingAndTrailingAndInternalWhitespaceTest1: StripLeadingAndTrailingAndInternalWhitespace<"    a    b   "> =
  "a b";

const stripLeadingAndTrailingAndInternalWhitespaceTest2: StripLeadingAndTrailingAndInternalWhitespace<"    a    b   c  "> =
  "a b c";

const stripLeadingAndTrailingAndInternalWhitespaceTest3: StripLeadingAndTrailingAndInternalWhitespace<"a    \nb"> =
  "a b";

// "10" => 10
type ParseInt<T> = T extends `${infer N extends number}` ? N : never;

const parseIntTest1: ParseInt<"10"> = 10;

// ------------------------------ plt tests ------------------------------

const plt1 = plt("one, date { plot 10px solid #d83 }");
plt1[0].y_fieldname === "one";
plt1[0].x_fieldname === "date";
plt1[0].plot_type === "plot";
plt1[0].width === 10;
plt1[0].draw_style === "solid";
plt1[0].color === "#d83";

const plt2 = plt("one, date { bar 10px solid #d83 }");
plt2[0].y_fieldname === "one";
plt2[0].x_fieldname === "date";
plt2[0].plot_type === "bar";
plt2[0].width === 10;
plt2[0].draw_style === "solid";
plt2[0].color === "#d83";

const plt3 = plt(
  "[one, two], date { bsdfdfar 10px [solid #d83, solid green] }"
);
plt3[0].y_fieldnames[0] === "one";
plt3[0].y_fieldnames[1] === "two";
plt3[0].plot_type === "bsdfdfar";
plt3[0].attributes[0][0] === "solid";
plt3[0].attributes[0][1] === "#d83";
plt3[0].attributes[1][0] === "solid";
plt3[0].attributes[1][1] === "green";

const plt4 = plt("one, date { highlight 0 1 solid yellow }");
plt4[0].y_fieldname === "one";
plt4[0].x_fieldname === "date";
plt4[0].plot_type === "highlight";
plt4[0].start === "0";
plt4[0].end === "1";
plt4[0].draw_style === "solid";
plt4[0].color === "yellow";

const plt5 = plt(
  "[one, two], date { stackbar 10px [solid #d83, solid green] }"
);
plt5[0].y_fieldnames[0] === "one";
plt5[0].y_fieldnames[1] === "two";
plt5[0].plot_type === "stackbar";
plt5[0].width === 10;
plt5[0].options[0][0] === "solid";
plt5[0].options[0][1] === "#d83";
plt5[0].options[1][0] === "solid";
plt5[0].options[1][1] === "green";

const plt6 = plt("[one, two], date { blip 10px [solid #d83,solid green] }");
plt6[0].y_fieldnames[0] === "one";
plt6[0].y_fieldnames[1] === "two";
plt6[0].plot_type === "blip";
plt6[0].global_options[0] === "10px";
plt6[0].attributes[0][0] === "solid";
plt6[0].attributes[0][1] === "#d83";
plt6[0].attributes[1][0] === "solid";
plt6[0].attributes[1][1] === "green";

const plt7 = plt(
  "[one, two, three], date { stackbar 10px [solid #d83, solid green, dotted red] }"
);
plt7[0].y_fieldnames[0] === "one";
plt7[0].y_fieldnames[1] === "two";
plt7[0].y_fieldnames[2] === "three";
plt7[0].plot_type === "stackbar";
plt7[0].width === 10;
plt7[0].options[0][0] === "solid";
plt7[0].options[0][1] === "#d83";
plt7[0].options[1][0] === "solid";
plt7[0].options[1][1] === "green";
plt7[0].options[2][0] === "dotted";
plt7[0].options[2][1] === "red";

const plt8 = plt("[one, two], date { bar 10px [solid #d83, solid green] }");
plt8[0].y_fieldnames[0] === "one";
plt8[0].y_fieldnames[1] === "two";
plt8[0].plot_type === "bar";
plt8[0].width === 10;
plt8[0].options[0][0] === "solid";
plt8[0].options[0][1] === "#d83";
plt8[0].options[1][0] === "solid";
plt8[0].options[1][1] === "green";

const plt9 = plt("[one, two], date { plot 10px [solid #d83, solid green] }");
plt9[0].y_fieldnames[0] === "one";
plt9[0].y_fieldnames[1] === "two";
plt9[0].plot_type === "plot";
plt9[0].width === 10;
plt9[0].options[0][0] === "solid";
plt9[0].options[0][1] === "#d83";
plt9[0].options[1][0] === "solid";
plt9[0].options[1][1] === "green";

const plt10 = plt("[one, two],date { plot 10px solid #d83 }");
plt10[0].y_fieldnames[0] === "one";
plt10[0].y_fieldnames[1] === "two";
plt10[0].plot_type === "plot";
plt10[0].width === 10;
plt10[0].draw_style === "solid";
plt10[0].color === "#d83";

const plt11 = plt("one,date { plot 10px solid #d83 }");
plt11[0].y_fieldname === "one";
plt11[0].x_fieldname === "date";
plt11[0].plot_type === "plot";
plt11[0].width === 10;
plt11[0].draw_style === "solid";
plt11[0].color === "#d83";

const plt12 = plt("one,date{plot 10px solid #d83}");
plt12[0].y_fieldname === "one";
plt12[0].x_fieldname === "date";
plt12[0].plot_type === "plot";
plt12[0].width === 10;
plt12[0].draw_style === "solid";
plt12[0].color === "#d83";

const plt13 = plt("three, date { bleep blop blip green 10 }");
plt13[0].y_fieldname === "three";
plt13[0].x_fieldname === "date";
plt13[0].plot_type === "bleep";
plt13[0].attributes[0] === "blop";
plt13[0].attributes[1] === "blip";
plt13[0].attributes[2] === "green";
plt13[0].attributes[3] === "10";

const plt14 = plt(
  "[one,two,three],date{ stackbar 10px [solid orange, dashed #fed, dotted #8d2] }"
);
plt14[0].y_fieldnames[0] === "one";
plt14[0].y_fieldnames[1] === "two";
plt14[0].y_fieldnames[2] === "three";
plt14[0].x_fieldname === "date";
plt14[0].plot_type === "stackbar";
plt14[0].width === 10;
plt14[0].options[0][0] === "solid";
plt14[0].options[0][1] === "orange";
plt14[0].options[1][0] === "dashed";
plt14[0].options[1][1] === "#fed";
plt14[0].options[2][0] === "dotted";
plt14[0].options[2][1] === "#8d2";

const plt15 = plt(
  "[one,two,three],date{stackbar 10px [solid orange,dashed #fed,dotted #8d2]}"
);
plt15[0].y_fieldnames[0] === "one";
plt15[0].y_fieldnames[1] === "two";
plt15[0].y_fieldnames[2] === "three";
plt15[0].x_fieldname === "date";
plt15[0].plot_type === "stackbar";
plt15[0].width === 10;
plt15[0].options[0][0] === "solid";
plt15[0].options[0][1] === "orange";
plt15[0].options[1][0] === "dashed";
plt15[0].options[1][1] === "#fed";
plt15[0].options[2][0] === "dotted";
plt15[0].options[2][1] === "#8d2";

const plt16 = plt(
  "[one,two,three],date{stackbar 10px[solid orange,dashed #fed,dotted #8d2]}"
);
plt16[0].y_fieldnames[0] === "one";
plt16[0].y_fieldnames[1] === "two";
plt16[0].y_fieldnames[2] === "three";
plt16[0].x_fieldname === "date";
plt16[0].plot_type === "stackbar";
plt16[0].width === 10;
plt16[0].options[0][0] === "solid";
plt16[0].options[0][1] === "orange";
plt16[0].options[1][0] === "dashed";
plt16[0].options[1][1] === "#fed";
plt16[0].options[2][0] === "dotted";
plt16[0].options[2][1] === "#8d2";

const plt17 = plt(
  `[one,two,three], date      
  {
      stackbar 10px[solid orange,dashed #fed,dotted #8d2]
  }`
);
plt17[0].y_fieldnames[0] === "one";
plt17[0].y_fieldnames[1] === "two";
plt17[0].y_fieldnames[2] === "three";
plt17[0].x_fieldname === "date";
plt17[0].plot_type === "stackbar";
plt17[0].width === 10;
plt17[0].options[0][0] === "solid";
plt17[0].options[0][1] === "orange";
plt17[0].options[1][0] === "dashed";
plt17[0].options[1][1] === "#fed";
plt17[0].options[2][0] === "dotted";
plt17[0].options[2][1] === "#8d2";

const plt18 = plt(
  `
    one

    ,

  
  date   

  {
    
      stackbar 10px   
      
      [
        solid orange,

        dashed #fed,
        
        dotted #8d2
      ]
  }`
);
plt18[0].y_fieldname === "one";
plt18[0].x_fieldname === "date";
plt18[0].plot_type === "stackbar";
plt18[0].width === 10;
plt18[0].options[0][0] === "solid";
plt18[0].options[0][1] === "orange";
plt18[0].options[1][0] === "dashed";
plt18[0].options[1][1] === "#fed";
plt18[0].options[2][0] === "dotted";
plt18[0].options[2][1] === "#8d2";

const plt19 = plt(
  `
  
  [

    
    one
    

    ,


    two
    

    ,


    three


  ]
  
  
  ,
  

  date   


  {
    

      stackbar 
      
      
      10px   
      

      [



        solid 
        
        
        orange
        
        
        ,


        dashed 
        
        
        #fed
        
        
        ,
        

        dotted
        
        
        #8d2


      ]

      
  }
  
  
  `
);
plt19[0].y_fieldnames[0] === "one";
plt19[0].y_fieldnames[1] === "two";
plt19[0].y_fieldnames[2] === "three";
plt19[0].x_fieldname === "date";
plt19[0].plot_type === "stackbar";
plt19[0].width === 10;
plt19[0].options[0][0] === "solid";
plt19[0].options[0][1] === "orange";
plt19[0].options[1][0] === "dashed";
plt19[0].options[1][1] === "#fed";
plt19[0].options[2][0] === "dotted";
plt19[0].options[2][1] === "#8d2";

const plt20 = plt(
  `
  [one, two], date { bsdfdfar 10px [solid #d83, dotted green] }

  three, date { highlight 0 1 solid yellow }

  [six, two], date { stackbar 12px [dashed #274, solid black] }

  `
);
plt20[0].y_fieldnames[0] === "one";
plt20[0].y_fieldnames[1] === "two";
plt20[0].plot_type === "bsdfdfar";
plt20[0].attributes[0][0] === "solid";
plt20[0].attributes[0][1] === "#d83";
plt20[0].attributes[1][0] === "dotted";
plt20[0].attributes[1][1] === "green";
plt20[1].y_fieldname === "three";
plt20[1].x_fieldname === "date";
plt20[1].plot_type === "highlight";
plt20[1].start === "0";
plt20[1].end === "1";
plt20[1].draw_style === "solid";
plt20[1].color === "yellow";
plt20[2].y_fieldnames[0] === "six";
plt20[2].y_fieldnames[1] === "two";
plt20[2].plot_type === "stackbar";
plt20[2].width === 12;
plt20[2].options[0][0] === "dashed";
plt20[2].options[0][1] === "#274";
plt20[2].options[1][0] === "solid";
plt20[2].options[1][1] === "black";

const plt21 = plt(
  `
  [
    
    one

    , 

    two
  
  ]
  
  , 
  
  date 
  
  { 
    
    bsdfdfar
       
    10px 
    
    [
      
      solid 
      
      #d83
      
      , 
        
      dotted 
      
      green]
    
    }

  three
  
  ,
  
  date 
  
  { 
    
    highlight
    
    0 
    
    1 
    
    solid 
    
    yellow 
  
  }

  [
    
    six
    
    , 
    
    two
  
  ]
  
  , 
  
  date 
  
  { 
    
    stackbar 
    
    12px 
    
    [
      
      dashed #274
      
      , 
      
      solid 
      
      black] 
    
    }

  `
);
plt21[0].y_fieldnames[0] === "one";
plt21[0].y_fieldnames[1] === "two";
plt21[0].plot_type === "bsdfdfar";
plt21[0].attributes[0][0] === "solid";
plt21[0].attributes[0][1] === "#d83";
plt21[0].attributes[1][0] === "dotted";
plt21[0].attributes[1][1] === "green";
plt21[1].y_fieldname === "three";
plt21[1].x_fieldname === "date";
plt21[1].plot_type === "highlight";
plt21[1].start === "0";
plt21[1].end === "1";
plt21[1].draw_style === "solid";
plt21[1].color === "yellow";
plt21[2].y_fieldnames[0] === "six";
plt21[2].y_fieldnames[1] === "two";
plt21[2].plot_type === "stackbar";
plt21[2].width === 12;
plt21[2].options[0][0] === "dashed";
plt21[2].options[0][1] === "#274";
plt21[2].options[1][0] === "solid";
plt21[2].options[1][1] === "black";

const fail1 = plt("one, date { }");
// @ts-expect-error
fail1.y_fieldname === "one";

const fail2 = plt("one date { plot 10px solid #d83 }");
// @ts-expect-error
fail2.y_fieldname === "one";

const fail3 = plt("one, date  plot 10px solid }");
// @ts-expect-error
fail3.y_fieldname === "one";
