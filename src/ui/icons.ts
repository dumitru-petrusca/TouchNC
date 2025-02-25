import {CssClass} from './commonStyles';

const svgNamespace = "http://www.w3.org/2000/svg";

export enum Icon {
  logo,
  spindleCcw,
  spindleCw,
  spindleOff,
  fullscreen,
  delete,
  gotoZero,
  lockClosed,
  lockOpen,
  person,
  playCircle,
  tools,
  cog,
  prefs,
  menu,
  upload,
  download,
  edit,
  folderNew,
  folderUp,
  folder,
  file,
  x,
  play,
  pause,
  stop,
  up,
  down,
  coolantOn,
  coolantOff
}

export const iconList = new Map<Icon, string>([
  [Icon.logo, "M421-59q-42.29 0-78.63-16.65Q306.02-92.3 282-125L57-412l48-39q20.89-17.28 47.95-18.14Q180-470 206-459l78 41v-332q0-16.25 12.65-28.63Q309.29-791 325.96-791q18.07 0 30.06 12.37Q368-766.25 368-750v473l-173-92 159 196q11.03 15.6 27.9 22.8 16.87 7.2 37.1 7.2h241q31.99 0 54.99-22.57Q738-188.15 738-221.33V-366q0-35.52-23.94-58.76Q690.13-448 655-448H448v-84h206.65q69.98 0 118.66 48.29Q822-435.42 822-366v145q0 67.7-47.65 114.85Q726.7-59 660.45-59H421ZM156-651q-13-20.64-20.5-45.39-7.5-24.76-7.5-52.97 0-81.64 58.15-139.14Q244.3-946 325.68-946t139.85 57.62Q524-830.76 524-749q0 28.34-7.26 52.92Q509.48-671.5 497-651l-75-43q6-11 10.5-25.03 4.5-14.02 4.5-30.04 0-46.18-32.69-78.06Q371.62-859 326.06-859t-78.31 32.05Q215-794.91 215-749.13q0 15.87 4.25 30T231-694l-75 43Zm311 313Z"],
  [Icon.spindleCcw, "M479.77-398.78q-33.6 0-57.57-23.81-23.98-23.81-23.98-57.24 0-33.43 23.83-57.41 23.83-23.98 57.29-23.98 33.69 0 57.79 23.6 24.09 23.6 24.09 57.52 0 33.93-23.93 57.62-23.92 23.7-57.52 23.7Zm-.45 292.91q-155.29 0-264.76-109.41Q105.09-324.7 105.87-481h78.65q.65 122.91 86.43 209.41t208.48 86.5q123.66 0 209.29-85.81t85.63-209q0-123.2-85.63-209.1-85.63-85.91-209.29-85.91-63.66 0-120.39 26.82Q302.3-721.26 259-674.35h92.13V-607H131.26v-218.74h66.78v99.78q54.7-60.87 127.64-94.8 72.94-33.94 153.52-33.94 78.17 0 146.44 29.63t118.89 80.36q50.61 50.72 80.11 118.84 29.49 68.11 29.49 145.98 0 77.87-29.63 145.83-29.63 67.97-80.11 118.73-50.48 50.77-118.85 80.11-68.36 29.35-146.22 29.35Z"],
  [Icon.spindleCw, "M478.3-145.87q-138.65 0-236.39-97.74-97.74-97.74-97.74-236.25t97.74-236.68q97.74-98.16 236.39-98.16 88.4 0 155.45 35.76 67.04 35.76 115.86 98.9V-814.7h66.78v274.92H540.91V-606h165.74q-38.56-57.74-95.3-93.33-56.74-35.58-133.05-35.58-106.88 0-180.89 73.98-74.02 73.99-74.02 180.83 0 106.84 74.02 180.93 74.02 74.08 180.91 74.08 80.16 0 147.74-46.08 67.59-46.09 95.16-121.83H803q-29.56 110.65-119.67 178.89-90.1 68.24-205.03 68.24Z"],
  [Icon.spindleOff, "M806.17-52.04 654.7-202.96q-23.96 14.7-46.64 24.33Q585.39-169 560.43-162v-82.22q9.57-3 18.57-7.22 9-4.21 18.56-9.21L258.83-599.39q-17.87 28.74-25.24 60.69-7.37 31.96-7.37 61.7 0 55.74 20.65 101.26t62.96 81.39l26.6 17.61V-390h66.79v238.48H164.74v-66.22h116.43l-9.91-8.04q-69.7-55.7-97.76-118.11Q145.43-406.3 146.43-477q1-55.13 15.57-99.54 14.56-44.42 39.13-80.55L54.17-804.04l45.53-45.53 752 752-45.53 45.53Zm-62.95-236-57.26-56.7q19.87-30.17 30.74-64.35 10.86-34.17 10.86-73.91 0-43.74-21.65-91.26t-59.95-86.39l-25.61-22.61V-570h-66.79v-238.48h238.48v66.22H674.61l9.91 10.04q65.7 61.13 94.26 126.83Q807.35-539.7 807.35-483q0 55.7-16.07 103.54-16.06 47.85-48.06 91.42ZM341.35-689.35l-55.7-55.69q24.83-18.7 52.28-31.61 27.46-12.92 56.42-20.35v81.22q-13 4.43-26.5 11.43t-26.5 15Z"],
  [Icon.coolantOff, "M800-435q0 39-12 81.5T757-276l-45-45q12-24 20-57t8-57q0-50-22-99t-57-83L480-796 359-674l-43-43 164-163 225 222q44 44 69.5 102T800-435Zm6 379L676-186q-39 32-90.5 49T480-120q-132 0-226-91.5T160-435q0-57 17-106t53-91L57-805l43-43L849-99l-43 43ZM480-180q46 0 85.5-12t68.5-37L273-590q-24 29-38.5 67.5T220-435q0 107 76.5 181T480-180Zm-26-242Zm102-96Z"],
  [Icon.coolantOn, "M479-208q16 0 24.5-5.5T512-230q0-11-8.5-17t-25.5-6q-42 0-85.5-26.5T337-373q-2-9-9-14.5t-15-5.5q-11 0-17 8.5t-4 17.5q15 84 71 121.5T479-208Zm1 128q-137 0-228.5-94T160-408q0-100 79.5-217.5T480-880q161 137 240.5 254.5T800-408q0 140-91.5 234T480-80Zm0-60q112 0 186-76.5T740-408q0-79-66.5-179.5T480-800Q353-688 286.5-587.5T220-408q0 115 74 191.5T480-140Zm0-340Z"],
  [Icon.fullscreen, "M105.87-105.87V-324.3h79.22v139.21H324.3v79.22H105.87Zm530.39 0v-79.22h138.65V-324.3h79.79v218.43H636.26ZM105.87-636.26V-854.7H324.3v79.79H185.09v138.65h-79.22Zm669.04 0v-138.65H636.26v-79.79H854.7v218.44h-79.79Z"],
  [Icon.delete, "M334.52-288 480-433.48 625.48-288 672-334.52 526.52-480 672-625.48 625.48-672 480-526.52 334.52-672 288-625.48 433.48-480 288-334.52 334.52-288ZM480.08-65.87q-85.47 0-161.01-32.39-75.53-32.4-131.97-88.84-56.44-56.44-88.84-131.89-32.39-75.46-32.39-160.93 0-86.47 32.39-162.01 32.4-75.53 88.75-131.5t131.85-88.62q75.5-32.65 161.01-32.65 86.52 0 162.12 32.61 75.61 32.6 131.53 88.5 55.93 55.89 88.55 131.45Q894.7-566.58 894.7-480q0 85.55-32.65 161.07-32.65 75.53-88.62 131.9-55.97 56.37-131.42 88.77-75.46 32.39-161.93 32.39Zm-.08-79.22q139.74 0 237.33-97.73 97.58-97.73 97.58-237.18 0-139.74-97.58-237.33-97.59-97.58-237.61-97.58-139.02 0-236.83 97.58-97.8 97.59-97.8 237.61 0 139.02 97.73 236.83 97.73 97.8 237.18 97.8ZM480-480Z"],
  [Icon.gotoZero, "M476.61-313.65 642.96-480 476.61-646.35l-55.57 56.13 70.61 70.61H317v79.22h174.65l-70.61 70.61 55.57 56.13Zm3.47 247.78q-85.47 0-161.01-32.39-75.53-32.4-131.97-88.84-56.44-56.44-88.84-131.89-32.39-75.46-32.39-160.93 0-86.47 32.39-162.01 32.4-75.53 88.75-131.5t131.85-88.62q75.5-32.65 161.01-32.65 86.52 0 162.12 32.61 75.61 32.6 131.53 88.5 55.93 55.89 88.55 131.45Q894.7-566.58 894.7-480q0 85.55-32.65 161.07-32.65 75.53-88.62 131.9-55.97 56.37-131.42 88.77-75.46 32.39-161.93 32.39Zm-.08-79.22q139.74 0 237.33-97.73 97.58-97.73 97.58-237.18 0-139.74-97.58-237.33-97.59-97.58-237.61-97.58-139.02 0-236.83 97.58-97.8 97.59-97.8 237.61 0 139.02 97.73 236.83 97.73 97.8 237.18 97.8ZM480-480Z"],
  [Icon.lockClosed, "M225.09-67q-32.68 0-55.95-23.27-23.27-23.27-23.27-55.95v-423.82q0-32.91 23.27-56.35 23.27-23.44 55.95-23.44h58.69v-83.56q0-82.44 57.17-140.18 57.16-57.73 139.02-57.73 81.86 0 139.05 57.73 57.2 57.74 57.2 140.18v83.56h58.69q32.91 0 56.35 23.44 23.44 23.44 23.44 56.35v423.82q0 32.68-23.44 55.95Q767.82-67 734.91-67H225.09Zm0-79.22h509.82v-423.82H225.09v423.82Zm255.08-134.91q31.83 0 54.33-22.03t22.5-52.97q0-30-22.67-54.5t-54.5-24.5q-31.83 0-54.33 24.5t-22.5 55q0 30.5 22.67 52.5t54.5 22ZM363-649.83h234v-83.43q0-49.96-33.79-84.11-33.8-34.15-82.96-34.15t-83.21 34.15Q363-783.22 363-733.26v83.43ZM225.09-146.22v-423.82 423.82Z"],
  [Icon.lockOpen, "M225.09-146.22h509.82v-423.82H225.09v423.82Zm255.08-134.91q31.83 0 54.33-22.03t22.5-52.97q0-30-22.67-54.5t-54.5-24.5q-31.83 0-54.33 24.5t-22.5 55q0 30.5 22.67 52.5t54.5 22ZM225.09-146.22v-423.82 423.82Zm0 79.22q-32.68 0-55.95-23.27-23.27-23.27-23.27-55.95v-423.82q0-32.91 23.27-56.35 23.27-23.44 55.95-23.44h292.13v-83.56q0-82.44 57.37-140.18 57.37-57.73 139.51-57.73 81.92 0 139.02 57.73 57.1 57.74 57.1 140.18h-79.79q0-49.67-33.66-83.9-33.67-34.23-82.65-34.23-49.6 0-83.36 34.15T597-733.26v83.43h137.91q32.91 0 56.35 23.44 23.44 23.44 23.44 56.35v423.82q0 32.68-23.44 55.95Q767.82-67 734.91-67H225.09Z"],
  [Icon.person, "M479.88-488.35q-72.33 0-118.17-45.84t-45.84-118.17q0-72.34 45.84-118.29 45.84-45.96 118.17-45.96 72.34 0 118.58 45.96 46.24 45.95 46.24 118.29 0 72.33-46.24 118.17t-118.58 45.84ZM145.87-138.52v-109.15q0-41.67 21.16-72.19 21.17-30.51 54.75-46.36 68.13-30.56 131.31-45.85 63.17-15.28 126.76-15.28 64.67 0 127.24 15.78 62.56 15.79 130.05 45.55 35.04 15.23 56.3 45.76 21.26 30.52 21.26 72.45v109.29H145.87Zm79.22-79.22h509.82v-27.78q0-15.64-9.5-29.84t-23.5-21.03q-61.74-29.31-113.32-40.24-51.58-10.93-108.87-10.93-56.15 0-109.31 10.93-53.15 10.93-113.08 40.15-14.24 6.84-23.24 21.07-9 14.22-9 29.89v27.78Zm254.79-349.83q36.86 0 60.95-24 24.08-24 24.08-60.89 0-37.13-23.97-61.03t-60.82-23.9q-36.86 0-60.95 23.93-24.08 23.93-24.08 60.72 0 37.03 23.97 61.1t60.82 24.07Zm.12-84.91Zm0 434.74Z"],
  [Icon.playCircle, "M379.61-304.35 656.22-480 379.61-656.22v351.87ZM480.08-65.87q-85.47 0-161.01-32.39-75.53-32.4-131.97-88.84-56.44-56.44-88.84-131.89-32.39-75.46-32.39-160.93 0-86.47 32.39-162.01 32.4-75.53 88.75-131.5t131.85-88.62q75.5-32.65 161.01-32.65 86.52 0 162.12 32.61 75.61 32.6 131.53 88.5 55.93 55.89 88.55 131.45Q894.7-566.58 894.7-480q0 85.55-32.65 161.07-32.65 75.53-88.62 131.9-55.97 56.37-131.42 88.77-75.46 32.39-161.93 32.39Zm-.08-79.22q139.74 0 237.33-97.73 97.58-97.73 97.58-237.18 0-139.74-97.58-237.33-97.59-97.58-237.61-97.58-139.02 0-236.83 97.58-97.8 97.59-97.8 237.61 0 139.02 97.73 236.83 97.73 97.8 237.18 97.8ZM480-480Z"],
  [Icon.tools, "M207.22-893.57h546.13L611.7-691.26v506.13L480-54 348.87-185.13v-506.13L207.22-893.57Zm220.87 348.22h103.82v-178l63-91H365.09l63 91v178Zm103.82 60H428.09v118h103.82v-118Zm0 261v-83H428.09v83L480-172.43l51.91-51.92Zm-51.91-321Zm0 178Zm0-178Zm0 60Zm0 178Z"],
  [Icon.cog, "M375.56-65.87 355-196.39q-15.61-5.31-34.07-15.89-18.45-10.59-31.63-21.33l-121.95 56.26-106-187.17 111.39-81.26q-1.44-7.31-1.94-17.11-.5-9.81-.5-17.11 0-7.3.5-17.11.5-9.8 1.94-17.11L61.35-596.04l106-186.05 123.08 55.7q12.61-10.18 30.79-20.48 18.17-10.3 33.78-15.17l20.56-132.66h208.88L605-763.04q15.61 5.87 34.28 15.67 18.68 9.8 31.42 20.98l122.52-55.7 105.43 186.05-111.95 79.82q1.43 8.31 2.21 18.11.79 9.81.79 18.11 0 8.3-.79 17.61-.78 9.3-2.21 17.61l111.95 80.26-106 187.17-122.52-56.26q-13.17 10.74-30.85 21.55-17.67 10.8-34.28 15.67L584.44-65.87H375.56Zm64.96-79.22h78.39l14.57-111.43q33.56-8 63.91-25 30.35-17 54.35-42.7l106 46 34.91-64.65-92.87-67.87q4-17.56 6.78-34.63 2.79-17.06 2.79-34.63 0-17.57-2.29-34.63-2.28-17.07-7.28-34.63l93.44-67.87-35.48-64.65-105.44 46q-23-27.13-53.13-45.48-30.13-18.35-65.69-22.78l-14-110.87h-78.96l-13.43 110.87q-35.13 6.43-65.76 24.28-30.63 17.85-54.2 43.98l-104.87-46-35.48 64.65 92.31 67.3q-4 17.57-6.79 34.92-2.78 17.34-2.78 34.91 0 17.57 2.78 35.2 2.79 17.63 6.79 34.63l-92.31 67.3 35.48 64.65 104.87-46q24.57 25.13 55.2 42.7 30.63 17.56 64.76 25.56l13.43 110.87ZM478.87-350q54 0 92-38t38-92q0-54-38-92t-92-38q-54 0-92 38t-38 92q0 54 38 92t92 38ZM480-480Z"],
  [Icon.prefs, "M163-134v-294H81v-86h250v86h-82v294h-86Zm0-440v-252h86v252h-86Zm192-41v-86h82v-125h86v125h82v86H355Zm82 481v-421h86v421h-86Zm274 0v-127h-82v-86h250v86h-82v127h-86Zm0-273v-419h86v419h-86Z"],
  [Icon.menu, "M105.87-219.09v-79.78H854.7v79.78H105.87Zm0-221.3v-79.22H854.7v79.22H105.87Zm0-220.74v-79.78H854.7v79.78H105.87Z"],
  [Icon.upload, "M440.39-318.09v-343.87L323.78-544.78l-57.13-56.57L480-814.7l213.35 213.35-57.13 56.57-116.61-117.18v343.87h-79.22Zm-215.3 172.22q-32.51 0-55.87-23.35-23.35-23.36-23.35-55.87v-143h79.22v143h509.82v-143h79.79v143q0 32.48-23.53 55.85-23.52 23.37-56.26 23.37H225.09Z"],
  [Icon.download, "M480-318.09 266.65-531.44l57.13-56 116.61 116.61V-814.7h79.22v343.87l116.61-116.61 57.13 56L480-318.09ZM225.09-145.87q-32.51 0-55.87-23.35-23.35-23.36-23.35-55.87v-143h79.22v143h509.82v-143h79.79v143q0 32.48-23.53 55.85-23.52 23.37-56.26 23.37H225.09Z"],
  [Icon.edit, "M184.52-185.09h44.57l443.17-442.17-43.44-44-444.3 442.74v43.43Zm-78.65 79.22V-261l573.87-573.44q8.56-9.13 20.9-14.19 12.33-5.07 25.62-5.07 12.13 0 24.26 5.07 12.13 5.06 22.83 13.63L836-774.04q9.57 10.69 14.13 23.11 4.57 12.41 4.57 25.1 0 12.7-5.07 25.33-5.06 12.63-13.63 21.76L261.57-105.87h-155.7Zm664.09-620.96-41.57-42.13 41.57 42.13Zm-119.14 77.01-22-21.44 43.44 44-21.44-22.56Z"],
  [Icon.folder, "M145.09-145.87q-32.51 0-55.87-23.85-23.35-23.86-23.35-55.37v-509.82q0-31.74 23.35-55.76 23.36-24.03 55.87-24.03h269.69L481-747.91h333.91q31.74 0 55.76 23.85 24.03 23.86 24.03 55.36v443.61q0 31.51-24.03 55.37-24.02 23.85-55.76 23.85H145.09Zm0-79.22h669.82V-668.7H448.09l-66.22-66.21H145.09v509.82Zm0 0v-509.82 509.82Z"],
  [Icon.folderNew, "M548.87-308.13h66.78v-94.8h96.22V-470h-96.22v-95.65h-66.78v95.37h-96.22v67.06h96.22v95.09ZM145.09-145.87q-32.51 0-55.87-23.85-23.35-23.86-23.35-55.37v-509.82q0-31.74 23.35-55.76 23.36-24.03 55.87-24.03h269.69L481-747.91h333.91q31.74 0 55.76 23.85 24.03 23.86 24.03 55.36v443.61q0 31.51-24.03 55.37-24.02 23.85-55.76 23.85H145.09Zm0-79.22h669.82V-668.7H448.09l-66.22-66.21H145.09v509.82Zm0 0v-509.82 509.82Z"],
  [Icon.folderUp, "M444.35-277.74h71.3v-199.87l61 61 49.92-49.35L480-612.52 333.43-465.96l49.92 49.35 61-61v199.87ZM145.09-145.87q-32.51 0-55.87-23.85-23.35-23.86-23.35-55.37v-509.82q0-31.74 23.35-55.76 23.36-24.03 55.87-24.03h269.69L481-747.91h333.91q31.74 0 55.76 23.85 24.03 23.86 24.03 55.36v443.61q0 31.51-24.03 55.37-24.02 23.85-55.76 23.85H145.09Zm0-79.22h669.82V-668.7H448.09l-66.22-66.21H145.09v509.82Zm0 0v-509.82 509.82Z"],
  [Icon.file, "M319-248.87h322v-66.22H319v66.22Zm0-170h322v-66.22H319v66.22Zm-93.91 353q-32.51 0-55.87-23.35-23.35-23.36-23.35-55.87v-669.82q0-32.74 23.35-56.26 23.36-23.53 55.87-23.53h362.13L814.7-667.22v522.13q0 32.51-23.53 55.87-23.52 23.35-56.26 23.35H225.09Zm320.82-563.04v-186H225.09v669.82h509.82v-483.82h-189Zm-320.82-186v186-186V-145.09v-669.82Z"],
  [Icon.x, "M249-193.43 193.43-249l231-231-231-231L249-766.57l231 231 231-231L766.57-711l-231 231 231 231L711-193.43l-231-231-231 231Z"],
  [Icon.play, "M305.87-177v-612l480.7 306-480.7 306Zm79.22-306Zm0 161.39L639.39-483l-254.3-161.39v322.78Z"],
  [Icon.pause, "M524.43-174v-612H786v612H524.43ZM174-174v-612h261.57v612H174Zm430.22-79.78h102v-452.44h-102v452.44Zm-350.44 0h102v-452.44h-102v452.44Zm0-452.44v452.44-452.44Zm350.44 0v452.44-452.44Z"],
  [Icon.stop, "M305.09-654.91v349.82-349.82Zm-79.22 429.04V-734.7H734.7v508.83H225.87Zm79.22-79.22h349.82v-349.82H305.09v349.82Z"],
  [Icon.up, "M442.39-230.43v-386.44L282-459.48l-55.57-56.56L481-770.61l254.57 254.57L680-460.48 521.61-618.87v388.44h-79.22Z"],
  [Icon.down, "M479-226.43 224.43-481 280-537.57l160.39 157.39v-386.43h79.22v388.43L678-536.57 733.57-481 479-226.43Z"],
]);

export function svgIcon(
    name: Icon, w: string = "48px", h: string = "48px",
    color: string = "currentColor", css: CssClass | null = null): SVGSVGElement {

  const path = document.createElementNS(svgNamespace, "path");
  path.setAttribute("d", iconList.get(name) as string);
  // path.setAttribute("stroke", "black");
  // path.setAttribute("stroke-width", "3");
  path.setAttribute("fill", color);

  const g = document.createElementNS(svgNamespace, "g");
  g.setAttribute("transform", "translate(0, -25) scale(1, 1)");
  g.appendChild(path);

  const svg = document.createElementNS(svgNamespace, "svg");
  svg.setAttribute("width", w);
  svg.setAttribute("height", h);
  svg.setAttribute("viewBox", "0 -960 960 960");
  if (css != null) {
    svg.setAttribute("class", css.name);
  }
  svg.appendChild(g);
  return svg;
}
