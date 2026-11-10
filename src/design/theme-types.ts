export type ThemeId='midnight-carnival'|'neo-brutalist'|'velvet-gallery';
export interface ThemeSpec {
 id:ThemeId;
 label:string;
 eyebrow:string;
 tagline:string;
 description:string;
 treatment:'editorial'|'brutalist'|'bento';
 heroAlignment:'split'|'stacked'|'asymmetric';
 tokens:{
  ink:string;paper:string;accent:string;contrast:string;surface:string;
  border:string;shadow:string;radius:string;displayFont:string;
 };
 sampleQuoteIds:[string,string,string];
}
