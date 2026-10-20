const dateFmt = new Intl.DateTimeFormat("es-MX", { dateStyle: "long", timeZone: "America/Mexico_City" });

export interface PrivacyNoticeData {
  tradeName: string;
  legalName: string;
  legalAddress: string;
  contactEmail: string;
  updatedAt: string | Date;
}

/**
 * Texto del aviso de privacidad integral. Describe únicamente los tratamientos que la plataforma
 * realiza hoy; los datos del responsable vienen de /admin/configuracion. Debe revisarlo un asesor legal.
 */
export function PrivacyNoticeContent({ data }: { data: PrivacyNoticeData }) {
  return (
    <article className="space-y-8 text-foreground-secondary [&_section>*+*]:mt-3 [&_h2]:mb-3 [&_h2]:font-heading [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_li]:ml-5 [&_li]:list-disc [&_p]:leading-relaxed [&_ul]:space-y-1.5">
      <header className="space-y-3">
        <p className="text-sm font-medium tracking-wide text-electric uppercase">Aviso de privacidad</p>
        <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">Aviso de privacidad integral</h1>
        <p className="text-sm text-muted-foreground">Última actualización: {dateFmt.format(new Date(data.updatedAt))}</p>
      </header>

      <section>
        <h2>Responsable de tus datos personales</h2>
        <p>
          <strong className="text-foreground">{data.legalName}</strong>
          {data.tradeName && data.tradeName !== data.legalName ? ` («${data.tradeName}»)` : ""}, con domicilio en{" "}
          {data.legalAddress}, es responsable del tratamiento de los datos personales que nos proporcionas, conforme a la Ley
          Federal de Protección de Datos Personales en Posesión de los Particulares y demás normativa aplicable.
        </p>
        <p>
          Para cualquier asunto relacionado con tus datos personales escríbenos a{" "}
          <a href={`mailto:${data.contactEmail}`} className="text-electric underline underline-offset-2">
            {data.contactEmail}
          </a>
          .
        </p>
      </section>

      <section>
        <h2>Datos personales que recabamos</h2>
        <p>A través del formulario de contacto y del cotizador de este sitio recabamos:</p>
        <ul>
          <li>Datos de identificación y contacto: nombre, empresa, correo electrónico, teléfono, número de WhatsApp y país.</li>
          <li>Información de tu solicitud: tipo de negocio, solución de interés, componentes seleccionados en el cotizador y comentarios que nos escribas.</li>
        </ul>
        <p>No solicitamos datos personales sensibles ni datos financieros o de pago en este sitio.</p>
      </section>

      <section>
        <h2>Finalidades del tratamiento</h2>
        <p>Utilizamos tus datos para las siguientes finalidades, necesarias para atender tu solicitud:</p>
        <ul>
          <li>Responder tus solicitudes de información y contacto.</li>
          <li>Preparar, emitir, enviarte y dar seguimiento a las cotizaciones que solicites.</li>
          <li>Enviarte tu cotización por correo electrónico y, solo si lo autorizas expresamente, por WhatsApp.</li>
          <li>Atender la relación comercial que, en su caso, se derive de tu solicitud.</li>
        </ul>
        <p>No utilizamos tus datos para fines de mercadotecnia o publicidad.</p>
      </section>

      <section>
        <h2>Consentimiento</h2>
        <p>
          Al enviar el formulario de contacto o una solicitud de cotización otorgas tu consentimiento para el tratamiento descrito
          en este aviso; registramos la fecha y la versión del texto que aceptaste. El envío por WhatsApp requiere una autorización
          adicional que puedes otorgar o no.
        </p>
      </section>

      <section>
        <h2>Encargados y transferencias</h2>
        <p>
          Para operar este sitio nos apoyamos en proveedores tecnológicos que tratan los datos por nuestra cuenta y bajo nuestras
          instrucciones: servicios de hospedaje y base de datos, de envío de correo electrónico y, si lo autorizas, de mensajería de
          WhatsApp Business. No vendemos ni cedemos tus datos a terceros. Solo los transferiremos cuando una ley o una autoridad
          competente lo exija.
        </p>
      </section>

      <section>
        <h2>Derechos ARCO y revocación del consentimiento</h2>
        <p>
          Puedes acceder a tus datos, rectificarlos, cancelarlos u oponerte a su tratamiento (derechos ARCO), así como revocar tu
          consentimiento, enviando una solicitud a{" "}
          <a href={`mailto:${data.contactEmail}`} className="text-electric underline underline-offset-2">
            {data.contactEmail}
          </a>{" "}
          con:
        </p>
        <ul>
          <li>Tu nombre y un medio para comunicarte la respuesta.</li>
          <li>Los documentos que acrediten tu identidad o, en su caso, la representación legal.</li>
          <li>La descripción clara de los datos y del derecho que deseas ejercer.</li>
          <li>Cualquier elemento que facilite la localización de tus datos, como el folio de tu cotización.</li>
        </ul>
        <p>Responderemos tu solicitud en los plazos que establece la legislación aplicable.</p>
      </section>

      <section>
        <h2>Cookies y tecnologías similares</h2>
        <p>
          Este sitio no utiliza cookies de rastreo ni de publicidad. El cotizador guarda temporalmente tu avance en el
          almacenamiento de tu propio navegador, que se borra al cerrar la pestaña. El panel interno, de uso exclusivo de nuestro
          personal, utiliza una cookie de sesión necesaria para su funcionamiento.
        </p>
      </section>

      <section>
        <h2>Conservación y seguridad</h2>
        <p>
          Conservamos tus datos durante el tiempo necesario para cumplir las finalidades descritas y las obligaciones legales
          aplicables. Aplicamos medidas de seguridad administrativas, técnicas y físicas, como cifrado de las comunicaciones, control
          de acceso por roles y registro de actividad, para protegerlos contra daño, pérdida, alteración o acceso no autorizado.
        </p>
      </section>

      <section>
        <h2>Cambios a este aviso</h2>
        <p>Cualquier cambio a este aviso de privacidad se publicará en esta misma página, con su fecha de actualización.</p>
      </section>
    </article>
  );
}
