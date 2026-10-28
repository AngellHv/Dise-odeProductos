const router=require('express').Router();
const bcrypt=require('bcryptjs'); const jwt=require('jsonwebtoken');
const tech=require('../repositories/technician-repository'); const repairs=require('../repositories/repair-repository');
const {requireAuth}=require('../middleware/auth');
const v=require('../lib/validation');
router.post('/auth/login',async(req,res,next)=>{try{const usuario=v.requiredString(req.body.usuario,'El usuario',50);const password=v.requiredString(req.body.contrasena,'La contraseña',100);const t=await tech.byUsername(usuario);if(!t||!(await bcrypt.compare(password,t.contrasena)))return res.status(401).json({error:'El usuario o la contraseña no son válidos.'});const token=jwt.sign({id:t.id_tecnico,nombre:t.nombre},process.env.JWT_SECRET,{expiresIn:process.env.JWT_EXPIRES_IN||'8h'});res.json({token,nombreTecnico:t.nombre});}catch(e){next(e);}});
router.get('/seguimiento/:codigo',async(req,res,next)=>{try{const r=await repairs.byCode(v.requiredString(req.params.codigo,'El código',20));if(!r)return res.status(404).json({error:'No se encontró una reparación con ese código.'});res.json(r);}catch(e){next(e);}});
router.get('/seguimiento/:codigo/historial',async(req,res,next)=>{try{const r=await repairs.byCode(req.params.codigo);if(!r)return res.status(404).json({error:'No se encontró una reparación con ese código.'});res.json(await repairs.history(req.params.codigo));}catch(e){next(e);}});
router.use(requireAuth);
router.get('/reparaciones',async(req,res,next)=>{try{res.json(await repairs.list(String(req.query.buscar||'').slice(0,20)));}catch(e){next(e);}});
router.get('/reparaciones/:id',async(req,res,next)=>{try{const r=await repairs.get(v.parseId(req.params.id));if(!r)return res.status(404).json({error:'No se encontró la reparación.'});res.json(r);}catch(e){next(e);}});
router.post('/reparaciones',async(req,res,next)=>{try{const data=v.validateReparacion(req.body);const r=await repairs.create({...data,tecnicoId:req.user.id});res.status(201).json(r);}catch(e){next(e);}});
router.patch('/reparaciones/:id/estado',async(req,res,next)=>{try{const ok=await repairs.updateState(v.parseId(req.params.id),v.validateEstado(req.body.estado));if(!ok)return res.status(404).json({error:'No se encontró la reparación activa.'});res.json({mensaje:'Estado actualizado.'});}catch(e){next(e);}});
router.patch('/reparaciones/:id/detalles',async(req,res,next)=>{try{const ok=await repairs.updateDetails(v.parseId(req.params.id),v.validateDiagnosticoCosto(req.body));if(!ok)return res.status(404).json({error:'No se encontró la reparación activa.'});res.json({mensaje:'Diagnóstico y costo guardados.'});}catch(e){next(e);}});
router.delete('/reparaciones/:id',async(req,res,next)=>{try{const ok=await repairs.archive(v.parseId(req.params.id));if(!ok)return res.status(404).json({error:'La reparación ya no está en el listado activo.'});res.json({mensaje:'Reparación archivada. Su historial se conserva.'});}catch(e){next(e);}});
router.get('/clientes',async(req,res,next)=>{try{const q=String(req.query.buscar||'').trim();if(q.length<2)return res.json([]);const telefono=v.normalizePhoneSearch(q);const {pool}=require('../db/pool');const {rows}=await pool.query(`SELECT id_cliente AS id,nombre,telefono,correo
  FROM cliente
  WHERE nombre ILIKE $1
     OR telefono ILIKE $1
     OR ($2 <> '' AND regexp_replace(telefono,'[^0-9]','','g') LIKE $3)
  ORDER BY nombre LIMIT 10`,[`%${q}%`,telefono,`%${telefono}%`]);res.json(rows);}catch(e){next(e);}});
module.exports=router;
