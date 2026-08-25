/* E130 · Math Program Frame Metadata Bridge
 * Purpose: register math_program_frame/map as discoverable sources without rewriting subject-adapter.js or changing runtime UI.
 * Scope: metadata only. No renderer, no route toggle, no content import, no chapterId migration.
 */
(function(){
  'use strict';
  var RELEASE='E130_MATH_PROGRAM_FRAME_METADATA_BRIDGE';
  var A=window.SUBJECT_ADAPTER;
  if(!A){return;}

  function uniqPush(list,name){
    if(!Array.isArray(list)){list=[];}
    if(list.indexOf(name)<0){list.push(name);}
    return list;
  }

  A.e130ProgramFrame=A.e130ProgramFrame||{};
  A.e130ProgramFrame.release=RELEASE;
  A.e130ProgramFrame.status='metadata_only_not_runtime_route';
  A.e130ProgramFrame.contract='subjects/math/MATH_TAXONOMY_CONTRACT_E130.md';
  A.e130ProgramFrame.sources={
    frame:'data/math_program_frame.json',
    map:'data/math_program_map.json'
  };
  A.e130ProgramFrame.routePolicy={
    baumanRoute:'stage -> discipline -> chapter',
    programRoute:'block -> section -> program lecture anchor -> mapped chapters/content',
    defaultActiveRoute:'baumanRoute',
    rule:'E130 is an overlay. It must not replace E129 Theory route or existing chapter IDs.'
  };

  A.dataFiles=uniqPush(A.dataFiles,'math_program_frame');
  A.dataFiles=uniqPush(A.dataFiles,'math_program_map');
  A.initialDataFiles=uniqPush(A.initialDataFiles,'math_program_frame');
  A.initialDataFiles=uniqPush(A.initialDataFiles,'math_program_map');
  A.optionalDataFiles=Array.isArray(A.optionalDataFiles)?A.optionalDataFiles:[];
  A.backgroundDataFiles=Array.isArray(A.backgroundDataFiles)?A.backgroundDataFiles:[];

  A.dataSourceMeta=A.dataSourceMeta||{};
  A.dataSourceMeta.math_program_frame=Object.assign({},A.dataSourceMeta.math_program_frame||{}, {
    label:'Khung chương trình Toán E130',
    path:'data/math_program_frame.json',
    group:'E130 · Khung chương trình Bauman',
    required:true,
    lazy:false,
    plannedCount:21,
    e130ProgramFrame:true,
    runtimeRole:'program_frame_overlay',
    description:'2 khối, phân mục A-G, 21 lecture anchors, Bauman focus và Lab Work. Không chứa nội dung slide.'
  });
  A.dataSourceMeta.math_program_map=Object.assign({},A.dataSourceMeta.math_program_map||{}, {
    label:'Bản đồ gom chương vào E130',
    path:'data/math_program_map.json',
    group:'E130 · Khung chương trình Bauman',
    required:true,
    lazy:false,
    plannedCount:40,
    e130ProgramFrame:true,
    runtimeRole:'program_map_overlay',
    description:'Map active chapters 1-40 vào 21 lecture anchors bằng ID ổn định; không đổi chapterId.'
  });

  A.release=RELEASE;
  A.latestPatch=RELEASE;
  A.programFrameVersion='E130_MATH_PROGRAM_FRAME_INTEGRATED';

  window.BAUMAN_MATH_E130_PROGRAM_FRAME={
    release:RELEASE,
    status:'metadata_only',
    frameSource:'math_program_frame',
    mapSource:'math_program_map',
    contract:'subjects/math/MATH_TAXONOMY_CONTRACT_E130.md',
    selfCheck:function(){
      var adapter=window.SUBJECT_ADAPTER||{};
      var meta=adapter.dataSourceMeta||{};
      return {
        ok:!!(meta.math_program_frame&&meta.math_program_map),
        release:RELEASE,
        runtimeRoute:false,
        metadataOnly:true,
        frameInDataFiles:Array.isArray(adapter.dataFiles)&&adapter.dataFiles.indexOf('math_program_frame')>=0,
        mapInDataFiles:Array.isArray(adapter.dataFiles)&&adapter.dataFiles.indexOf('math_program_map')>=0,
        framePath:meta.math_program_frame&&meta.math_program_frame.path,
        mapPath:meta.math_program_map&&meta.math_program_map.path,
        note:'Round 5 only exposes E130 sources. UI route is reserved for Round 6.'
      };
    }
  };
})();
