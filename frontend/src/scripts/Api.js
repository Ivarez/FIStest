const API = (() => {
    const BASE_URL = "http://localhost:8080";

    async function apiFetch(path, opts = {}) {
        const url = path.startsWith("http") ? path : BASE_URL + path;
        const headers = Object.assign({ "Content-Type": "application/json" }, opts.headers || {});
        const res = await fetch(url, { ...opts, headers, mode: "cors" }).catch(err => ({ ok:false, _error: err }));
        if (!res || res._error) return { ok:false, status:0, data:{ ok:false, message:String(res?._error || "Fallo de red") } };
        let data = null;
        try { data = await res.json(); } catch { data = { ok:false, message:"Respuesta no JSON" }; }
        return { ok: res.ok, status: res.status, data };
    }

    return { apiFetch };
})();