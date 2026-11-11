export type ThemeId='midnight-carnival'|'neo-brutalist'|'velvet-gallery'|'dada-riot'|'neon-trickster'|'impossible-court'|'forbidden-library'|'riot-press';
export interface ThemeSpec {
 id:ThemeId;
 label:string;
 eyebrow:string;
 tagline:string;
 description:string;
 treatment:'editorial'|'brutalist'|'bento'|'dada'|'neon'|'surreal'|'library'|'riot';
 heroAlignment:'split'|'stacked'|'asymmetric';
 tokens:{
  ink:string;paper:string;accent:string;contrast:string;surface:string;
  border:string;shadow:string;radius:string;displayFont:string;
 };
 sampleQuoteIds:[string,string,string];
}
