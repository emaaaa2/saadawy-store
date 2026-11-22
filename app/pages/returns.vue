<template>
  <LegalPage :title="$t('policies.returns')" :updated="UPDATED">
    <template v-if="isAr">
      <section>
        <p>
          نحرص في سعداوي ستور على أن تكون تجربة التسوق لدينا مُرضية تمامًا. توضح هذه السياسة شروط استبدال
          المنتجات واسترجاعها، وتسري على المشتريات من متجرنا ومن موقعنا الإلكتروني.
        </p>
      </section>

      <section>
        <h2>1. الاستبدال</h2>
        <p>
          يحق للعميل استبدال المنتج خلال <strong>{{ RETURN_DAYS }} يومًا</strong> من تاريخ الشراء، أو من تاريخ
          استلام الطلب بالنسبة إلى الطلبات عبر الموقع، وفقًا للشروط التالية:
        </p>
        <ul>
          <li>تقديم فاتورة الشراء، أو رقم الطلب بالنسبة إلى الطلبات عبر الموقع.</li>
          <li>أن يكون المنتج بحالته الأصلية وغير مستخدم.</li>
          <li>أن يكون المنتج بتغليفه وملصقاته الأصلية، مع جميع الملحقات والهدايا المرفقة به.</li>
        </ul>
        <p>في حال وجود فرق في السعر بين المنتج الأصلي والمنتج البديل، يُسدَّد الفرق أو يُرد إلى العميل حسب الحالة.</p>
      </section>

      <section>
        <h2>2. الاسترجاع</h2>
        <p>يُتاح استرجاع المنتج واسترداد قيمته في الحالات التالية فقط:</p>
        <ul>
          <li>وجود عيب صناعة في المنتج.</li>
          <li>استلام منتج غير مطابق للفاتورة أو للطلب.</li>
          <li>وجود تلف في المنتج عند الاستلام.</li>
        </ul>
        <p class="note">
          لا يُعد تغيّر رأي العميل أو عدم ملاءمة المنتج له سببًا للاسترجاع، ويمكن في هذه الحالة استبدال المنتج وفقًا لشروط الاستبدال.
        </p>
      </section>

      <section>
        <h2>3. المنتجات المستثناة</h2>
        <p>لا يمكن استبدال أو استرجاع المنتجات التالية:</p>
        <ul>
          <li>الأجهزة الكهربائية.</li>
          <li>مستحضرات المكياج.</li>
          <li>العطور.</li>
          <li>أي منتج تم فتحه أو استخدامه.</li>
        </ul>
        <p>ويُستثنى من ذلك المنتج الذي يصل تالفًا أو به عيب صناعة أو مخالفًا للطلب، إذ يُستبدل أو تُرد قيمته.</p>
      </section>

      <section>
        <h2>4. المنتجات التالفة أو غير المطابقة</h2>
        <p>
          يُرجى إبلاغنا عبر واتساب خلال <strong>{{ DAMAGE_REPORT_HOURS }} ساعة</strong> من الاستلام، مع إرفاق صور توضح
          المنتج والمشكلة. وفي هذه الحالة يتحمل سعداوي ستور تكاليف الشحن كاملة.
        </p>
      </section>

      <section>
        <h2>5. تكاليف الشحن</h2>
        <ul>
          <li>المنتجات التالفة أو المعيبة أو غير المطابقة: يتحمل سعداوي ستور تكاليف الشحن.</li>
          <li>الاستبدال لأي سبب آخر: يتحمل العميل تكاليف شحن الاستبدال.</li>
        </ul>
      </section>

      <section>
        <h2>6. استرداد المبلغ</h2>
        <p>تُرد قيمة المنتج خلال <strong>{{ REFUND_DAYS }} أيام عمل</strong> من استلامه وفحصه، وفقًا لطريقة الدفع:</p>
        <table>
          <thead>
            <tr><th>طريقة الدفع</th><th>طريقة الاسترداد</th></tr>
          </thead>
          <tbody>
            <tr><td>بطاقة بنكية</td><td>إلى البطاقة نفسها، وقد يستغرق ظهور المبلغ وقتًا إضافيًا حسب البنك.</td></tr>
            <tr><td>نقدًا / محفظة إلكترونية / إنستاباي</td><td>إلى محفظة إلكترونية أو حساب إنستاباي، حسب اختيار العميل.</td></tr>
          </tbody>
        </table>
        <p>ويمكن للعميل اختيار استبدال المنتج بمنتج آخر بدلًا من استرداد قيمته.</p>
      </section>

      <section>
        <h2>7. خطوات تقديم الطلب</h2>
        <ol class="steps">
          <li>
            <strong>تواصل معنا</strong>
            أرسل رقم الطلب أو صورة الفاتورة وسبب الطلب عبر واتساب على
            <a :href="whatsappLink" target="_blank" rel="noopener noreferrer" dir="ltr">{{ settings.whatsappSupport }}</a>،
            مع صور المنتج إن وُجدت مشكلة. ويمكن للمشتريات من المتجر زيارتنا مباشرةً بالمنتج والفاتورة.
          </li>
          <li>
            <strong>استلام المنتج وفحصه</strong>
            ننسق معك موعد استلام المنتج بالنسبة إلى طلبات الموقع، ثم نفحصه للتأكد من استيفاء الشروط.
          </li>
          <li>
            <strong>الاستبدال أو الاسترداد</strong>
            نرسل إليك المنتج البديل، أو نرد قيمته خلال {{ REFUND_DAYS }} أيام عمل.
          </li>
        </ol>
      </section>

      <section>
        <h2>8. تحديث السياسة</h2>
        <p>يحتفظ سعداوي ستور بحق تعديل هذه السياسة، ويُعمل بالنسخة المنشورة على الموقع وقت الشراء.</p>
      </section>
    </template>

    <template v-else>
      <section>
        <p>
          At Saadawy Store, we want every purchase to be a satisfying one. This policy sets out the conditions for
          exchanges and returns, and applies to purchases from both our store and our website.
        </p>
      </section>

      <section>
        <h2>1. Exchanges</h2>
        <p>
          Products may be exchanged within <strong>{{ RETURN_DAYS }} days</strong> of purchase, or of delivery for
          website orders, provided that:
        </p>
        <ul>
          <li>The purchase invoice is presented, or the order number for website orders.</li>
          <li>The product is in its original condition and unused.</li>
          <li>The product is in its original packaging with its original labels, together with all accessories and gifts supplied with it.</li>
        </ul>
        <p>Where the replacement differs in price, the difference will be paid by or refunded to the customer as applicable.</p>
      </section>

      <section>
        <h2>2. Returns</h2>
        <p>A product may be returned for a refund only in the following cases:</p>
        <ul>
          <li>The product has a manufacturing defect.</li>
          <li>The product received does not match the invoice or the order.</li>
          <li>The product was damaged on delivery.</li>
        </ul>
        <p class="note">
          A change of mind, or a product not suiting the customer, is not grounds for a return; such products may be exchanged under the exchange conditions.
        </p>
      </section>

      <section>
        <h2>3. Non-exchangeable and non-returnable items</h2>
        <p>The following cannot be exchanged or returned:</p>
        <ul>
          <li>Electrical appliances.</li>
          <li>Makeup.</li>
          <li>Perfumes.</li>
          <li>Any product that has been opened or used.</li>
        </ul>
        <p>This does not apply to items that arrive damaged, defective or different from the order, which will be exchanged or refunded.</p>
      </section>

      <section>
        <h2>4. Damaged or incorrect items</h2>
        <p>
          Please notify us on WhatsApp within <strong>{{ DAMAGE_REPORT_HOURS }} hours</strong> of delivery, with photos showing
          the product and the issue. In such cases, Saadawy Store covers all shipping costs.
        </p>
      </section>

      <section>
        <h2>5. Shipping costs</h2>
        <ul>
          <li>Damaged, defective or incorrect items: shipping costs are covered by Saadawy Store.</li>
          <li>Exchanges for any other reason: exchange shipping costs are paid by the customer.</li>
        </ul>
      </section>

      <section>
        <h2>6. Refunds</h2>
        <p>Refunds are issued within <strong>{{ REFUND_DAYS }} working days</strong> of receiving and inspecting the product, according to the payment method:</p>
        <table>
          <thead>
            <tr><th>Payment method</th><th>Refund method</th></tr>
          </thead>
          <tbody>
            <tr><td>Bank card</td><td>To the same card; your bank may take additional time to show the amount.</td></tr>
            <tr><td>Cash / mobile wallet / InstaPay</td><td>To a mobile wallet or InstaPay account, as the customer prefers.</td></tr>
          </tbody>
        </table>
        <p>Customers may choose to exchange for another product instead of a refund.</p>
      </section>

      <section>
        <h2>7. How to make a request</h2>
        <ol class="steps">
          <li>
            <strong>Contact us</strong>
            Send your order number or a photo of the invoice and the reason on WhatsApp at
            <a :href="whatsappLink" target="_blank" rel="noopener noreferrer">{{ settings.whatsappSupport }}</a>,
            with photos if there is an issue. For in-store purchases, you may visit us with the product and invoice.
          </li>
          <li>
            <strong>Collection and inspection</strong>
            For website orders, we arrange a time to collect the product, then inspect it to confirm the conditions are met.
          </li>
          <li>
            <strong>Exchange or refund</strong>
            We send the replacement, or refund you within {{ REFUND_DAYS }} working days.
          </li>
        </ol>
      </section>

      <section>
        <h2>8. Policy updates</h2>
        <p>Saadawy Store reserves the right to amend this policy; the version published on the website at the time of purchase applies.</p>
      </section>
    </template>
  </LegalPage>
</template>

<script setup>
// The store's exchange and return policy (Eman, 2026-11-22).
const RETURN_DAYS = 14
const DAMAGE_REPORT_HOURS = 48
const REFUND_DAYS = 7
const UPDATED = '2026-11-22'

const settings = useStoreSettings()
const { t, isAr } = useLang()
const whatsappLink = computed(() => `https://wa.me/${toWhatsAppNumber(settings.value.whatsappSupport)}`)

useSeoMeta({
  title: () => t('policies.returns'),
  description: () => t('policies.returnsMeta', { days: RETURN_DAYS }),
})
</script>

<style scoped>
/* A highlighted line inside a section (e.g. what isn't grounds for a return). */
.note {
  @apply mt-3 rounded-2xl bg-gold/10 border border-gold/30 px-4 py-3 text-sm text-ink/80;
}

/* Numbered steps as three cards. */
.steps {
  @apply grid sm:grid-cols-3 gap-3 mt-2;
  counter-reset: step;
}
.steps li {
  @apply relative rounded-2xl border border-ink/10 bg-page/60 p-4 pt-12 text-sm leading-relaxed;
  counter-increment: step;
}
.steps li::before {
  content: counter(step);
  @apply absolute top-4 start-4 w-7 h-7 rounded-full bg-gold text-white text-sm font-bold flex items-center justify-center;
}
.steps strong {
  @apply block text-base mb-1;
}

table {
  @apply w-full mt-3 text-sm border border-ink/10 rounded-2xl overflow-hidden border-separate border-spacing-0;
}
th {
  @apply bg-page/80 text-ink font-semibold text-start px-3 sm:px-4 py-2.5 border-b border-ink/10;
}
td {
  @apply px-3 sm:px-4 py-3 align-top border-b border-ink/10;
}
tbody tr:last-child td {
  @apply border-b-0;
}
td:first-child {
  @apply font-medium text-ink w-2/5;
}
</style>
