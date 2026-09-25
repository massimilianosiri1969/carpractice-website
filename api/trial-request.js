import { fiscalError } from '../fiscal-validation.js';
export default async function handler(req,res){
  if(req.method!=="POST")return res.status(405).json({error:"Metodo non consentito"});
  const body=req.body||{};
  const error=fiscalError(body.vat_number,body.tax_code);
  if(error)return res.status(400).json({error});
  try{
    const target=process.env.SM_CONTROL_TRIAL_URL||"https://base44.app/api/apps/6a8c86f7159bd5420917f1f1/functions/carpractice-trial-request";
    const r=await fetch(target,{method:"POST",headers:{"Content-Type":"application/json","Origin":"https://carpractice.it"},body:JSON.stringify(body)});
    const text=await r.text();let data;try{data=JSON.parse(text)}catch{data={error:text||"Servizio non disponibile"}}
    return res.status(r.status).json(data);
  }catch(e){console.error('trial request forwarding failed', e);return res.status(502).json({error:"Non siamo riusciti a inviare la richiesta. Riprova tra poco."})}
}
