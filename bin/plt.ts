function plt<PltProgram extends string>(
  pltProgram: PltProgram extends "" ? never : PltProgram
): Plt<PltProgram> {
  return null as any;
}

type Plt<PltProgram extends string> =
  StripLeadingAndTrailingWhitespace<PltProgram> extends `[${infer Ys}]${infer RestWhitespace},${infer X}{${infer PltCmd}}`
    ? RestWhitespace extends Whitespace | `${Whitespace | ""}${infer More}`
      ? {
          y_fieldnames: FlattenSplitByComma<Ys>;
          x_fieldname: StripLeadingAndTrailingWhitespace<X>;
        } & PltCommand<StripLeadingAndTrailingWhitespace<PltCmd>>
      : never
    : PltProgram extends `${infer Y},${infer X}{${infer PltCmd}}`
    ? {
        y_fieldname: StripLeadingAndTrailingWhitespace<Y>;
        x_fieldname: StripLeadingAndTrailingWhitespace<X>;
      } & PltCommand<StripLeadingAndTrailingWhitespace<PltCmd>>
    : never;

type PltCommand<PltSpec> = PltSpec extends `${infer PltT} ${infer PltOpt}`
  ? {
      plot_type: PltPlotType<PltT>;
    } & PltOptions<PltT, PltOpt>
  : never;

type PltOptions<PltT, PltOpt> = PltT extends "plot" | "bar" | "stackbar"
  ? PltOpt extends `${infer PltWidth}px${infer RestWhitespace}[${infer PltO}]`
    ? RestWhitespace extends Whitespace | `${Whitespace | ""}${infer More}`
      ? {
          width: ParseInt<PltWidth>;
          options: SplitByCommaSpace<PltO>;
        }
      : never
    : PltOpt extends `${infer PltWidth}px${Whitespace}${infer PltStyle} ${infer PltColor}`
    ? {
        width: ParseInt<PltWidth>;
        draw_style: PltStyle;
        color: PltColor;
      }
    : never
  : PltT extends "highlight"
  ? PltOpt extends `${infer PltStart} ${infer PltEnd} ${infer PltStyle} ${infer PltColor}`
    ? {
        start: PltStart;
        end: PltEnd;
        draw_style: PltStyle;
        color: PltColor;
      }
    : never
  : PltOpt extends `${infer GlobalOpt}[${infer PltO}]`
  ? {
      global_options: FlattenSplitByCommaSpace<GlobalOpt>;
      options: SplitByCommaSpace<PltO>;
    }
  : PltOpt extends `${infer PltO}`
  ? {
      global_options: FlattenSplitByCommaSpace<PltO>;
    }
  : never;

type PltPlotType<PltT> = PltT;

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
const flattenSplitByCommaTest4: FlattenSplitByComma<"a, b, c"> = ["a", "b", "c"];

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

const splitByCommaSpaceTest3: SplitByCommaSpace<"    a b, c d, e f, g h     "> = [
  ["a", "b"],
  ["c", "d"],
  ["e", "f"],
  ["g", "h"],
];

const splitByCommaSpaceTest4: SplitByCommaSpace<"    a    b   ,      c    d   ,        e       f      ,         g       h     "> = [
  ["a", "b"],
  ["c", "d"],
  ["e", "f"],
  ["g", "h"],
];

const splitByCommaSpaceTest5: SplitByCommaSpace<"    a    b   \n,      c    d   \n,        e       f      \n,         g       h     \n,     i    j   "> = [
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
const flattenSplitByCommaSpaceTest2: FlattenSplitByCommaSpace<
  "a b, c d, e f"
> = [
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

const stripLeadingAndTrailingWhitespaceTest1: StripLeadingAndTrailingWhitespace<
  "  a  "
> = "a";

const stripLeadingAndTrailingWhitespaceTest2: StripLeadingAndTrailingWhitespace<
  "  a  b   "
> = "a  b";



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

const stripInternalMultipleWhitespaceTest1: StripInternalMultipleWhitespace<
  "a    b"
> = "a b";
const stripInternalMultipleWhitespaceTest2: StripInternalMultipleWhitespace<
  "a    \nb"
  > = "a b";

// "    a    b   " => "a b"
// "    a    b   c  " => "a b c"
// "a    \nb" => "a b"
type StripLeadingAndTrailingAndInternalWhitespace<S extends string> =
  StripInternalMultipleWhitespace<StripLeadingAndTrailingWhitespace<S>>;

const stripLeadingAndTrailingAndInternalWhitespaceTest1: StripLeadingAndTrailingAndInternalWhitespace<
  "    a    b   "> = "a b";

const stripLeadingAndTrailingAndInternalWhitespaceTest2: StripLeadingAndTrailingAndInternalWhitespace<
  "    a    b   c  "> = "a b c";

const stripLeadingAndTrailingAndInternalWhitespaceTest3: StripLeadingAndTrailingAndInternalWhitespace<
  "a    \nb"> = "a b";

// "10" => 10
type ParseInt<T> = T extends `${infer N extends number}` ? N : never;

const parseIntTest1: ParseInt<"10"> = 10;

// ------------------------------ plt tests ------------------------------

const plt1 = plt("one, date { plot 10px solid #d83 }");
plt1.y_fieldname === "one";
plt1.x_fieldname === "date";
plt1.plot_type === "plot";
plt1.width === 10;
plt1.draw_style === "solid";
plt1.color === "#d83";

const plt2 = plt("one, date { bar 10px solid #d83 }");
plt2.y_fieldname === "one";
plt2.x_fieldname === "date";
plt2.plot_type === "bar";
plt2.width === 10;
plt2.draw_style === "solid";
plt2.color === "#d83";

const plt3 = plt(
  "[one, two], date { bsdfdfar 10px [solid #d83, solid green] }"
);
plt3.y_fieldnames[0] === "one";
plt3.y_fieldnames[1] === "two";
plt3.plot_type === "bsdfdfar";
plt3.options[0][0] === "solid";
plt3.options[0][1] === "#d83";
plt3.options[1][0] === "solid";
plt3.options[1][1] === "green";

const plt4 = plt("one, date { highlight 0 1 solid yellow }");
plt4.y_fieldname === "one";
plt4.x_fieldname === "date";
plt4.plot_type === "highlight";
plt4.start === "0";
plt4.end === "1";
plt4.draw_style === "solid";
plt4.color === "yellow";

const plt5 = plt(
  "[one, two], date { stackbar 10px [solid #d83, solid green] }"
);
plt5.y_fieldnames[0] === "one";
plt5.y_fieldnames[1] === "two";
plt5.plot_type === "stackbar";
plt5.width === 10;
plt5.options[0][0] === "solid";
plt5.options[0][1] === "#d83";
plt5.options[1][0] === "solid";
plt5.options[1][1] === "green";

const plt6 = plt("[one, two], date { blip 10px [solid #d83,solid green] }");
plt6.y_fieldnames[0] === "one";
plt6.y_fieldnames[1] === "two";
plt6.plot_type === "blip";
plt6.global_options[0] === "10px";
plt6.options[0][0] === "solid";
plt6.options[0][1] === "#d83";
plt6.options[1][0] === "solid";
plt6.options[1][1] === "green";

const plt7 = plt(
  "[one, two, three], date { stackbar 10px [solid #d83, solid green, dotted red] }"
);
plt7.y_fieldnames[0] === "one";
plt7.y_fieldnames[1] === "two";
plt7.y_fieldnames[2] === "three";
plt7.plot_type === "stackbar";
plt7.width === 10;
plt7.options[0][0] === "solid";
plt7.options[0][1] === "#d83";
plt7.options[1][0] === "solid";
plt7.options[1][1] === "green";
plt7.options[2][0] === "dotted";
plt7.options[2][1] === "red";

const plt8 = plt("[one, two], date { bar 10px [solid #d83, solid green] }");
plt8.y_fieldnames[0] === "one";
plt8.y_fieldnames[1] === "two";
plt8.plot_type === "bar";
plt8.width === 10;
plt8.options[0][0] === "solid";
plt8.options[0][1] === "#d83";
plt8.options[1][0] === "solid";
plt8.options[1][1] === "green";

const plt9 = plt("[one, two], date { plot 10px [solid #d83, solid green] }");
plt9.y_fieldnames[0] === "one";
plt9.y_fieldnames[1] === "two";
plt9.plot_type === "plot";
plt9.width === 10;
plt9.options[0][0] === "solid";
plt9.options[0][1] === "#d83";
plt9.options[1][0] === "solid";
plt9.options[1][1] === "green";

const plt10 = plt("[one, two],date { plot 10px solid #d83 }");
plt10.y_fieldnames[0] === "one";
plt10.y_fieldnames[1] === "two";
plt10.plot_type === "plot";
plt10.width === 10;
plt10.draw_style === "solid";
plt10.color === "#d83";

const plt11 = plt("one,date { plot 10px solid #d83 }");
plt11.y_fieldname === "one";
plt11.x_fieldname === "date";
plt11.plot_type === "plot";
plt11.width === 10;
plt11.draw_style === "solid";
plt11.color === "#d83";

const plt12 = plt("one,date{plot 10px solid #d83}");
plt12.y_fieldname === "one";
plt12.x_fieldname === "date";
plt12.plot_type === "plot";
plt12.width === 10;
plt12.draw_style === "solid";
plt12.color === "#d83";

const plt13 = plt("three, date { bleep blop blip green 10 }");
plt13.y_fieldname === "three";
plt13.x_fieldname === "date";
plt13.plot_type === "bleep";
plt13.global_options[0] === "blop";
plt13.global_options[1] === "blip";
plt13.global_options[2] === "green";
plt13.global_options[3] === "10";

const plt14 = plt(
  "[one,two,three],date{ stackbar 10px [solid orange, dashed #fed, dotted #8d2] }"
);
plt14.y_fieldnames[0] === "one";
plt14.y_fieldnames[1] === "two";
plt14.y_fieldnames[2] === "three";
plt14.x_fieldname === "date";
plt14.plot_type === "stackbar";
plt14.width === 10;
plt14.options[0][0] === "solid";
plt14.options[0][1] === "orange";
plt14.options[1][0] === "dashed";
plt14.options[1][1] === "#fed";
plt14.options[2][0] === "dotted";
plt14.options[2][1] === "#8d2";

const plt15 = plt(
  "[one,two,three],date{stackbar 10px [solid orange,dashed #fed,dotted #8d2]}"
);
plt15.y_fieldnames[0] === "one";
plt15.y_fieldnames[1] === "two";
plt15.y_fieldnames[2] === "three";
plt15.x_fieldname === "date";
plt15.plot_type === "stackbar";
plt15.width === 10;
plt15.options[0][0] === "solid";
plt15.options[0][1] === "orange";
plt15.options[1][0] === "dashed";
plt15.options[1][1] === "#fed";
plt15.options[2][0] === "dotted";
plt15.options[2][1] === "#8d2";

const plt16 = plt(
  "[one,two,three],date{stackbar 10px[solid orange,dashed #fed,dotted #8d2]}"
);
plt16.y_fieldnames[0] === "one";
plt16.y_fieldnames[1] === "two";
plt16.y_fieldnames[2] === "three";
plt16.x_fieldname === "date";
plt16.plot_type === "stackbar";
plt16.width === 10;
plt16.options[0][0] === "solid";
plt16.options[0][1] === "orange";
plt16.options[1][0] === "dashed";
plt16.options[1][1] === "#fed";
plt16.options[2][0] === "dotted";
plt16.options[2][1] === "#8d2";

const plt17 = plt(
  `[one,two,three], date      
  {
      stackbar 10px[solid orange,dashed #fed,dotted #8d2]
  }`
);
plt17.y_fieldnames[0] === "one";
plt17.y_fieldnames[1] === "two";
plt17.y_fieldnames[2] === "three";
plt17.x_fieldname === "date";
plt17.plot_type === "stackbar";
plt17.width === 10;
plt17.options[0][0] === "solid";
plt17.options[0][1] === "orange";
plt17.options[1][0] === "dashed";
plt17.options[1][1] === "#fed";
plt17.options[2][0] === "dotted";
plt17.options[2][1] === "#8d2";

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
plt18.y_fieldname === "one";
plt18.x_fieldname === "date";
plt18.plot_type === "stackbar";
plt18.width === 10;
plt18.options[0][0] === "solid";
plt18.options[0][1] === "orange";
plt18.options[1][0] === "dashed";
plt18.options[1][1] === "#fed";
plt18.options[2][0] === "dotted";
plt18.options[2][1] === "#8d2";

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
plt19.y_fieldnames[0] === "one";
plt19.y_fieldnames[1] === "two";
plt19.y_fieldnames[2] === "three";
plt19.x_fieldname === "date";
plt19.plot_type === "stackbar";
plt19.width === 10;
plt19.options[0][0] === "solid";
plt19.options[0][1] === "orange";
plt19.options[1][0] === "dashed";
plt19.options[1][1] === "#fed";
plt19.options[2][0] === "dotted";
plt19.options[2][1] === "#8d2";

const fail1 = plt("one, date { }");
// @ts-expect-error
fail1.y_fieldname === "one";

const fail2 = plt("one date { plot 10px solid #d83 }");
// @ts-expect-error
fail2.y_fieldname === "one";

const fail3 = plt("one, date  plot 10px solid }");
// @ts-expect-error
fail3.y_fieldname === "one";
