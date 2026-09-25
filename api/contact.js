export default async function handler(req,res){
  if(req.method!=="POST")return res.status(405).json({error:"Metodo non consentito"});
  const body=req.body||{};
  if(String(body.message||'').length>3000)return res.status(400).json({error:'Messaggio troppo lungo.'});
  try{
    const target="https://base44.app/api/apps/6a8c86f7159bd5420917f1f1/functions/carpractice-contact";
    const r=await fetch(target,{method:"POST",headers:{"Content-Type":"application/json","Origin":"https://carpractice.it"},body:JSON.stringify(body)});
    const text=await r.text();let data;try{data=JSON.parse(text)}catch{data={error:"Servizio temporaneamente non disponibile"}}
    return res.status(r.status).json(data);
  }catch(error){return res.status(502).json({error:"Non siamo riusciti a inviare il messaggio. Riprova più tardi."})}
}
