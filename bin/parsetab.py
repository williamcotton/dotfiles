
# parsetab.py
# This file is automatically generated. Do not edit.
# pylint: disable=W,C,R
_tabversion = '3.10'

_lr_method = 'LALR'

_lr_signature = "COLOR DRAW_STYLE FIELDNAME HIGHLIGHT INTEGER LBRACE LBRACKET PLOTNAME RBRACE RBRACKET WIDTHprogram : command\n    | program commandcommand : fields display RBRACE\n    | fields LBRACE displaycommand : fields LBRACE display RBRACEfields : FIELDNAME ',' FIELDNAME\n    | fields ',' FIELDNAME\n    | LBRACKET fields RBRACKET ',' FIELDNAMEfields : LBRACKET fields ',' FIELDNAME\n    | fields RBRACKET ',' FIELDNAMEdisplay : PLOTNAME WIDTH LBRACKET multi_style RBRACKET\n    | HIGHLIGHT INTEGER INTEGER style\n    | PLOTNAME WIDTH style\n    | PLOTNAME\n    | display PLOTNAMEstyle : DRAW_STYLE COLORmulti_style : DRAW_STYLE COLOR ',' DRAW_STYLE COLOR\n    | multi_style ',' DRAW_STYLE COLOR"
    
_lr_action_items = {'FIELDNAME':([0,1,2,5,6,9,11,13,15,16,17,19,24,25,28,31,35,36,38,],[4,4,-1,4,-2,18,-14,22,-3,-15,-4,26,32,-5,-13,37,-16,-12,-11,]),'LBRACKET':([0,1,2,5,6,11,15,16,17,20,25,28,35,36,38,],[5,5,-1,5,-2,-14,-3,-15,-4,27,-5,-13,-16,-12,-11,]),'$end':([1,2,6,11,15,16,17,25,28,35,36,38,],[0,-1,-2,-14,-3,-15,-4,-5,-13,-16,-12,-11,]),'LBRACE':([3,18,22,26,32,37,],[8,-7,-6,-10,-9,-8,]),',':([3,4,10,14,18,22,23,26,32,33,37,40,43,45,],[9,13,19,24,-7,-6,31,-10,-7,39,-8,42,-18,-17,]),'RBRACKET':([3,14,18,22,26,32,33,37,43,45,],[10,23,-7,-6,-10,-7,38,-8,-18,-17,]),'PLOTNAME':([3,7,8,11,16,17,18,22,26,28,32,35,36,37,38,],[11,16,11,-14,-15,16,-7,-6,-10,-13,-9,-16,-12,-8,-11,]),'HIGHLIGHT':([3,8,18,22,26,32,37,],[12,12,-7,-6,-10,-9,-8,]),'RBRACE':([7,11,16,17,28,35,36,38,],[15,-14,-15,25,-13,-16,-12,-11,]),'WIDTH':([11,],[20,]),'INTEGER':([12,21,],[21,30,]),'DRAW_STYLE':([20,27,30,39,42,],[29,34,29,41,44,]),'COLOR':([29,34,41,44,],[35,40,43,45,]),}

_lr_action = {}
for _k, _v in _lr_action_items.items():
   for _x,_y in zip(_v[0],_v[1]):
      if not _x in _lr_action:  _lr_action[_x] = {}
      _lr_action[_x][_k] = _y
del _lr_action_items

_lr_goto_items = {'program':([0,],[1,]),'command':([0,1,],[2,6,]),'fields':([0,1,5,],[3,3,14,]),'display':([3,8,],[7,17,]),'style':([20,30,],[28,36,]),'multi_style':([27,],[33,]),}

_lr_goto = {}
for _k, _v in _lr_goto_items.items():
   for _x, _y in zip(_v[0], _v[1]):
       if not _x in _lr_goto: _lr_goto[_x] = {}
       _lr_goto[_x][_k] = _y
del _lr_goto_items
_lr_productions = [
  ("S' -> program","S'",1,None,None,None),
  ('program -> command','program',1,'p_program','plt',285),
  ('program -> program command','program',2,'p_program','plt',286),
  ('command -> fields display RBRACE','command',3,'p_error_command','plt',291),
  ('command -> fields LBRACE display','command',3,'p_error_command','plt',292),
  ('command -> fields LBRACE display RBRACE','command',4,'p_command','plt',307),
  ('fields -> FIELDNAME , FIELDNAME','fields',3,'p_fields','plt',359),
  ('fields -> fields , FIELDNAME','fields',3,'p_fields','plt',360),
  ('fields -> LBRACKET fields RBRACKET , FIELDNAME','fields',5,'p_fields','plt',361),
  ('fields -> LBRACKET fields , FIELDNAME','fields',4,'p_fields_error','plt',377),
  ('fields -> fields RBRACKET , FIELDNAME','fields',4,'p_fields_error','plt',378),
  ('display -> PLOTNAME WIDTH LBRACKET multi_style RBRACKET','display',5,'p_display','plt',390),
  ('display -> HIGHLIGHT INTEGER INTEGER style','display',4,'p_display','plt',391),
  ('display -> PLOTNAME WIDTH style','display',3,'p_display','plt',392),
  ('display -> PLOTNAME','display',1,'p_display','plt',393),
  ('display -> display PLOTNAME','display',2,'p_display','plt',394),
  ('style -> DRAW_STYLE COLOR','style',2,'p_style','plt',415),
  ('multi_style -> DRAW_STYLE COLOR , DRAW_STYLE COLOR','multi_style',5,'p_multi_style','plt',421),
  ('multi_style -> multi_style , DRAW_STYLE COLOR','multi_style',4,'p_multi_style','plt',422),
]
