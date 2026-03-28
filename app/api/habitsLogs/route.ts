import { supabase } from "@/lib/supabase/config/supabaseClient";
import { NextResponse } from "next/server";



export async function GETALL(request : Request) {

	try {

	const authHeader = request.headers.get("authorization");
	const token = authHeader?.replace("Bearer ", "");
	
	if (!token) {
		return NextResponse.json({ error: "No autorizado" }, { status: 401 });
	}
	
	const { data: userData, error: userError } = await supabase.auth.getUser(token);
	if (userError || !userData.user) {
		return NextResponse.json({ error: "Usuario no válido" }, { status: 401 });
	}

	const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
	
	const { data, error, count } = await supabase
  .from('habit_logs')
  .select('*', { count: 'exact' }) 
  .eq('user_id', userData.user.id)
  .gte('created_at', firstDayOfMonth)
  .order('created_at', { ascending: false }); // Los más recientes primero
	
	if (error) return NextResponse.json({ error: error.message }, { status: 400 });

	console.log(data);
	
	
	return NextResponse.json(data);
		
	} catch (error) {
		return NextResponse.json({ error: "Error al obtener registros" }, { status: 500 });
	}



}