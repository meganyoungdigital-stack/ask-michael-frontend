"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background px-6 py-20">

      {/* NAV */}
      <div className="max-w-6xl mx-auto mb-10 flex justify-start items-center">
        <Link href="/">
          <Button variant="outline">← Back to Platform</Button>
        </Link>
      </div>

      {/* HERO */}
      <div className="max-w-6xl mx-auto text-center mb-20">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-bold mb-6"
        >
          Terms and Conditions
        </motion.h1>

        <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-6">
          These Terms and Conditions govern your access to and use of the
          Ask Michael platform, including user accounts, partner accounts,
          AI-assisted engineering tools, generated content, subscriptions,
          and related services.
        </p>

        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
          Effective Date: 24 August 2026
        </p>

        <div className="flex justify-center gap-4 mt-8">
          <Link href="/portal">
            <Button size="lg">Enter Platform →</Button>
          </Link>

          <Link href="/pricing">
            <Button variant="outline" size="lg">
              View Pricing
            </Button>
          </Link>
        </div>
      </div>

      {/* GRID */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">

        {/* SECTION 1 */}
        <motion.div>
          <Card className="p-6 rounded-2xl shadow">
            <CardContent>
              <h3 className="text-xl font-semibold mb-3">
                1. Acceptance of These Terms
              </h3>

              <p className="text-muted-foreground whitespace-pre-line">
                By accessing, registering for, purchasing, or using Ask
                Michael, you acknowledge that you have read, understood, and
                agree to be bound by these Terms and Conditions.

                {"\n\n"}

                If you do not agree with these Terms and Conditions, you must
                not access or use the platform.

                {"\n\n"}

                Where you create or use an account on behalf of a company,
                employer, organisation, or other legal entity, you confirm
                that you have the authority to bind that entity to these
                Terms and Conditions.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* SECTION 2 */}
        <motion.div>
          <Card className="p-6 rounded-2xl shadow">
            <CardContent>
              <h3 className="text-xl font-semibold mb-3">
                2. About Ask Michael
              </h3>

              <p className="text-muted-foreground whitespace-pre-line">
                Ask Michael is an AI-assisted software platform designed to
                provide information, analysis, document assistance, technical
                guidance, workflow support, and other tools relating primarily
                to heavy engineering, aluminium smelting, welding, repair,
                documentation, and related technical activities.

                {"\n\n"}

                Ask Michael uses artificial intelligence and other automated
                technologies to generate responses and other outputs based on
                information provided by users and information available to the
                platform.

                {"\n\n"}

                The platform is an information and decision-support tool. It
                is not a substitute for appropriately qualified professional
                judgment.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* SECTION 3 */}
        <motion.div>
          <Card className="p-6 rounded-2xl shadow">
            <CardContent>
              <h3 className="text-xl font-semibold mb-3">
                3. Eligibility and Authority
              </h3>

              <p className="text-muted-foreground whitespace-pre-line">
                You must provide accurate and truthful information when
                creating or maintaining an account.

                {"\n\n"}

                You are responsible for ensuring that you are legally entitled
                to use the platform and that your use of the platform complies
                with all laws, regulations, contractual obligations, workplace
                requirements, and professional obligations applicable to you.

                {"\n\n"}

                If you use Ask Michael on behalf of a business or organisation,
                you represent that you are authorised to do so and that you
                have the necessary authority to submit information, documents,
                images, drawings, specifications, and other materials on its
                behalf.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* SECTION 4 */}
        <motion.div>
          <Card className="p-6 rounded-2xl shadow">
            <CardContent>
              <h3 className="text-xl font-semibold mb-3">
                4. Accounts and Account Security
              </h3>

              <p className="text-muted-foreground whitespace-pre-line">
                You are responsible for maintaining the confidentiality and
                security of your account credentials, passwords, authentication
                information, API keys, access tokens, and other account
                credentials.

                {"\n\n"}

                You are responsible for activities carried out through your
                account, except where applicable law provides otherwise.

                {"\n\n"}

                You must immediately notify Ask Michael if you believe that
                your account, password, API key, or other credentials have
                been compromised or used without authorisation.

                {"\n\n"}

                You must not share credentials with unauthorised persons or
                permit third parties to access an account in a manner that
                breaches these Terms.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* SECTION 5 */}
        <motion.div>
          <Card className="p-6 rounded-2xl shadow">
            <CardContent>
              <h3 className="text-xl font-semibold mb-3">
                5. Partner Accounts
              </h3>

              <p className="text-muted-foreground whitespace-pre-line">
                Partner accounts may provide access to additional platform
                functionality, usage allowances, API access, billing
                arrangements, or other services agreed between Ask Michael
                and the relevant partner.

                {"\n\n"}

                The partner is responsible for ensuring that its employees,
                contractors, representatives, customers, systems, and other
                authorised users comply with these Terms.

                {"\n\n"}

                A partner remains responsible for activity carried out through
                credentials, API keys, or other access mechanisms issued to
                that partner, subject to applicable law.

                {"\n\n"}

                Partners must take reasonable steps to protect API keys and
                must not publish, distribute, sell, or otherwise disclose
                private credentials to unauthorised persons.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* SECTION 6 */}
        <motion.div>
          <Card className="p-6 rounded-2xl shadow">
            <CardContent>
              <h3 className="text-xl font-semibold mb-3">
                6. Acceptable Use
              </h3>

              <p className="text-muted-foreground whitespace-pre-line">
                You agree to use Ask Michael only for lawful and legitimate
                purposes.

                {"\n\n"}

                You must not misuse the platform, attempt to gain
                unauthorised access, interfere with platform functionality,
                circumvent usage limits, reverse engineer the service,
                introduce malicious code, abuse API access, or use the
                platform to violate the rights of another person or
                organisation.

                {"\n\n"}

                You must not use Ask Michael in a manner that could reasonably
                be expected to damage the platform, its infrastructure, its
                users, or its service providers.

                {"\n\n"}

                Ask Michael may suspend or restrict access where reasonably
                necessary to protect the platform, its users, its systems, or
                third parties.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* SECTION 7 */}
        <motion.div>
          <Card className="p-6 rounded-2xl shadow">
            <CardContent>
              <h3 className="text-xl font-semibold mb-3">
                7. AI-Generated Information and Outputs
              </h3>

              <p className="text-muted-foreground whitespace-pre-line">
                Ask Michael uses artificial intelligence to generate
                responses, recommendations, explanations, analyses,
                summaries, documents, templates, and other outputs.

                {"\n\n"}

                AI-generated outputs may contain errors, omissions,
                inaccuracies, outdated information, inappropriate
                recommendations, or incorrect interpretations of information
                supplied to the platform.

                {"\n\n"}

                AI output must therefore be treated as assistance and
                information rather than as a guaranteed statement of fact or
                professional advice.

                {"\n\n"}

                Ask Michael does not guarantee that any AI-generated output is
                accurate, complete, current, suitable for a particular
                purpose, or free from errors.

                {"\n\n"}

                You are responsible for independently reviewing and verifying
                all material AI-generated output before relying upon,
                implementing, approving, signing, issuing, publishing, or
                distributing it.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* SECTION 8 */}
        <motion.div>
          <Card className="p-6 rounded-2xl shadow">
            <CardContent>
              <h3 className="text-xl font-semibold mb-3">
                8. Engineering, Safety and Professional Responsibility
              </h3>

              <p className="text-muted-foreground whitespace-pre-line">
                Ask Michael is not a replacement for a qualified engineer,
                welding engineer, inspector, safety professional, legal
                adviser, regulatory specialist, or other appropriately
                qualified professional.

                {"\n\n"}

                Information produced by Ask Michael may relate to engineering,
                welding, fabrication, aluminium smelting, pot shell repair,
                maintenance, inspection, technical documentation, standards,
                codes, procedures, or safety-related matters.

                {"\n\n"}

                Such information must be independently reviewed by suitably
                qualified and authorised personnel before being used in an
                actual engineering, manufacturing, construction, repair,
                maintenance, safety, compliance, or operational environment.

                {"\n\n"}

                You remain solely responsible for determining whether a
                recommendation, calculation, procedure, drawing,
                specification, document, repair method, welding instruction,
                or other output is appropriate for the specific circumstances
                in which you intend to use it.

                {"\n\n"}

                You are also responsible for complying with applicable laws,
                regulations, engineering requirements, workplace requirements,
                safety procedures, standards, codes, specifications,
                manufacturer requirements, customer requirements, and
                professional obligations.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* SECTION 9 */}
        <motion.div>
          <Card className="p-6 rounded-2xl shadow">
            <CardContent>
              <h3 className="text-xl font-semibold mb-3">
                9. Standards, Codes and Compliance
              </h3>

              <p className="text-muted-foreground whitespace-pre-line">
                References to ISO standards, welding standards, engineering
                codes, regulations, specifications, procedures, material
                grades, industry practices, or other technical requirements
                are provided for informational and decision-support purposes.

                {"\n\n"}

                Ask Michael does not guarantee that any generated content
                satisfies the requirements of a particular standard,
                certification body, regulator, customer, employer, insurer,
                auditor, engineer, inspector, or other authority.

                {"\n\n"}

                Users must obtain and consult the applicable official,
                current, and authorised versions of standards, codes,
                regulations, specifications, and other controlling documents.

                {"\n\n"}

                Where a qualified person, competent authority, customer,
                employer, regulator, inspector, or certification body is
                required to approve work or documentation, that approval
                remains the responsibility of the relevant qualified or
                authorised person or organisation.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* SECTION 10 */}
        <motion.div>
          <Card className="p-6 rounded-2xl shadow">
            <CardContent>
              <h3 className="text-xl font-semibold mb-3">
                10. User-Submitted Information and Documents
              </h3>

              <p className="text-muted-foreground whitespace-pre-line">
                You are responsible for ensuring that you have the necessary
                rights, permissions, licences, consents, and authority to
                submit any information, documents, drawings, photographs,
                images, specifications, data, text, or other materials to Ask
                Michael.

                {"\n\n"}

                You must not upload or submit material that you are not
                authorised to disclose or process.

                {"\n\n"}

                You remain responsible for the accuracy, completeness, and
                legality of information that you provide to the platform.

                {"\n\n"}

                Ask Michael does not assume responsibility for determining
                whether you have the legal right to submit information or
                whether information supplied by you is accurate or complete.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* SECTION 11 */}
        <motion.div>
          <Card className="p-6 rounded-2xl shadow">
            <CardContent>
              <h3 className="text-xl font-semibold mb-3">
                11. User Content and Generated Content
              </h3>

              <p className="text-muted-foreground whitespace-pre-line">
                You retain responsibility for content and information that you
                submit to the platform.

                {"\n\n"}

                Subject to applicable law and any separate written agreement,
                Ask Michael does not claim ownership of your confidential
                business information merely because you submit it to the
                platform.

                {"\n\n"}

                You grant Ask Michael the permissions reasonably necessary to
                process submitted information for the purpose of providing,
                maintaining, securing, improving, and supporting the services,
                subject to applicable privacy and data-protection obligations.

                {"\n\n"}

                You remain responsible for reviewing AI-generated material
                before using or distributing it and for ensuring that its use
                does not infringe the rights of another person or organisation.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* SECTION 12 */}
        <motion.div>
          <Card className="p-6 rounded-2xl shadow">
            <CardContent>
              <h3 className="text-xl font-semibold mb-3">
                12. Intellectual Property
              </h3>

              <p className="text-muted-foreground whitespace-pre-line">
                Ask Michael and its licensors retain all rights, title, and
                interest in the platform, software, interface, branding,
                logos, designs, technology, source code, documentation,
                features, and other proprietary materials forming part of the
                service.

                {"\n\n"}

                Except where expressly permitted by Ask Michael or applicable
                law, you may not copy, reproduce, modify, distribute, sell,
                lease, sublicense, reverse engineer, decompile, or create
                derivative works from the platform or its proprietary
                components.

                {"\n\n"}

                Nothing in these Terms transfers ownership of Ask Michael's
                underlying software or technology to a user or partner.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* SECTION 13 */}
        <motion.div>
          <Card className="p-6 rounded-2xl shadow">
            <CardContent>
              <h3 className="text-xl font-semibold mb-3">
                13. Payments and Subscriptions
              </h3>

              <p className="text-muted-foreground whitespace-pre-line">
                Certain features or services may require payment.

                {"\n\n"}

                Payments may be processed through third-party payment
                providers, including Paystack or other providers made
                available by Ask Michael.

                {"\n\n"}

                You agree to provide accurate billing information and to pay
                applicable charges when due.

                {"\n\n"}

                Pricing, subscription plans, usage limits, billing cycles, and
                included features will be presented at the relevant point of
                purchase or subscription.

                {"\n\n"}

                Unless otherwise required by applicable law or expressly
                agreed in writing, fees already properly incurred are not
                refundable merely because the service was not used during the
                applicable billing period.

                {"\n\n"}

                Third-party payment providers may have their own terms,
                conditions, privacy policies, and processing requirements.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* SECTION 14 */}
        <motion.div>
          <Card className="p-6 rounded-2xl shadow">
            <CardContent>
              <h3 className="text-xl font-semibold mb-3">
                14. Service Availability and Third-Party Services
              </h3>

              <p className="text-muted-foreground whitespace-pre-line">
                Ask Michael aims to provide reliable access to the platform
                but does not guarantee that the service will always be
                available, uninterrupted, secure, error-free, or free from
                delays.

                {"\n\n"}

                The service may occasionally be unavailable because of
                maintenance, upgrades, technical problems, security events,
                network failures, infrastructure problems, or circumstances
                outside Ask Michael's reasonable control.

                {"\n\n"}

                The platform may depend upon third-party infrastructure and
                services, including hosting, authentication, payment
                processing, databases, artificial intelligence services,
                telecommunications, and other service providers.

                {"\n\n"}

                To the maximum extent permitted by applicable law, Ask Michael
                is not responsible for failures caused solely by third-party
                services or circumstances outside its reasonable control.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* SECTION 15 */}
        <motion.div>
          <Card className="p-6 rounded-2xl shadow">
            <CardContent>
              <h3 className="text-xl font-semibold mb-3">
                15. Privacy and Personal Information
              </h3>

              <p className="text-muted-foreground whitespace-pre-line">
                Personal information submitted through Ask Michael may be
                processed in accordance with our Privacy Policy and applicable
                data-protection laws.

                {"\n\n"}

                You are responsible for ensuring that you have the necessary
                authority or lawful basis to provide personal information
                relating to other individuals through your account.

                {"\n\n"}

                Where you use Ask Michael on behalf of an organisation, you
                remain responsible for complying with applicable privacy,
                confidentiality, employment, contractual, and data-protection
                requirements relating to information that you submit.

                {"\n\n"}

                Our Privacy Policy explains how personal information is
                collected, used, stored, protected, and otherwise processed.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* SECTION 16 */}
        <motion.div>
          <Card className="p-6 rounded-2xl shadow">
            <CardContent>
              <h3 className="text-xl font-semibold mb-3">
                16. Confidentiality and Sensitive Information
              </h3>

              <p className="text-muted-foreground whitespace-pre-line">
                Users and partners should carefully consider whether highly
                confidential, commercially sensitive, proprietary, regulated,
                or legally privileged information should be submitted to an
                online AI service.

                {"\n\n"}

                You are responsible for ensuring that your use of the platform
                is permitted by your own confidentiality agreements, employer
                policies, customer contracts, regulatory requirements, and
                other applicable obligations.

                {"\n\n"}

                Unless expressly agreed in writing, Ask Michael does not
                provide a guarantee that information submitted to the platform
                is subject to a specific industry-specific confidentiality
                regime beyond the protections and obligations expressly
                described in our Privacy Policy and applicable agreements.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* SECTION 17 */}
        <motion.div>
          <Card className="p-6 rounded-2xl shadow">
            <CardContent>
              <h3 className="text-xl font-semibold mb-3">
                17. Security and Unauthorised Access
              </h3>

              <p className="text-muted-foreground whitespace-pre-line">
                Ask Michael takes reasonable measures intended to protect the
                platform and information processed through it.

                {"\n\n"}

                However, no internet-based system can be guaranteed to be
                completely secure.

                {"\n\n"}

                You acknowledge that risks may arise from compromised
                credentials, malware, phishing, insecure devices, network
                failures, third-party infrastructure, user error, or other
                circumstances outside Ask Michael's reasonable control.

                {"\n\n"}

                You must take reasonable steps to protect your own devices,
                passwords, API keys, authentication information, and account
                access.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* SECTION 18 */}
        <motion.div>
          <Card className="p-6 rounded-2xl shadow">
            <CardContent>
              <h3 className="text-xl font-semibold mb-3">
                18. Suspension and Termination
              </h3>

              <p className="text-muted-foreground whitespace-pre-line">
                You may stop using Ask Michael at any time, subject to any
                outstanding contractual or payment obligations.

                {"\n\n"}

                Ask Michael may suspend, restrict, or terminate access where
                reasonably necessary because of a breach of these Terms,
                suspected misuse, security concerns, non-payment, unlawful
                activity, abuse of the service, or circumstances affecting the
                operation or security of the platform.

                {"\n\n"}

                Where reasonably practicable and appropriate, Ask Michael may
                provide notice before taking such action.

                {"\n\n"}

                Termination does not automatically remove obligations that by
                their nature are intended to survive termination, including
                provisions relating to intellectual property, liability,
                indemnification, confidentiality, payment obligations, and
                dispute resolution.
              </p>
            </CardContent>
          </Card>
        </motion.div>

      </div>

      {/* SECTION 19 */}
      <div className="max-w-4xl mx-auto mt-24">
        <Card className="p-6 rounded-2xl shadow">
          <CardContent>
            <h3 className="text-xl font-semibold mb-3">
              19. Disclaimer of Warranties
            </h3>

            <p className="text-muted-foreground whitespace-pre-line">
              To the maximum extent permitted by applicable law, Ask Michael
              provides the platform and its AI-assisted features on an
              "as-is" and "as-available" basis.

              {"\n\n"}

              Ask Michael does not warrant that the platform will always be
              available, uninterrupted, error-free, secure, accurate,
              complete, suitable for a particular purpose, or capable of
              meeting every user's requirements.

              {"\n\n"}

              Ask Michael does not warrant that AI-generated information will
              be accurate, complete, current, suitable for a particular
              engineering application, compliant with a particular standard,
              or free from errors or omissions.

              {"\n\n"}

              Nothing in these Terms excludes or limits any warranty,
              guarantee, right, or remedy that cannot lawfully be excluded or
              limited under applicable law.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* SECTION 20 */}
      <div className="max-w-4xl mx-auto mt-8">
        <Card className="p-6 rounded-2xl shadow">
          <CardContent>
            <h3 className="text-xl font-semibold mb-3">
              20. Limitation of Liability
            </h3>

            <p className="text-muted-foreground whitespace-pre-line">
              To the maximum extent permitted by applicable law, Ask Michael,
              its owners, operators, employees, contractors, service providers,
              licensors, and affiliates will not be liable for indirect,
              incidental, special, consequential, exemplary, or punitive
              losses or damages arising from or relating to your use of, or
              inability to use, the platform.

              {"\n\n"}

              This may include, to the extent permitted by law, loss of
              profits, loss of revenue, loss of business opportunities, loss
              of anticipated savings, loss of data, business interruption, or
              other indirect commercial losses.

              {"\n\n"}

              To the maximum extent permitted by applicable law, Ask Michael
              will not be responsible for losses arising from a user's
              reliance upon unverified AI-generated information, technical
              recommendations, calculations, procedures, documents,
              specifications, engineering suggestions, safety-related
              information, or other generated output.

              {"\n\n"}

              Users remain responsible for reviewing and independently
              verifying AI-generated output before using it in any real-world
              application.

              {"\n\n"}

              Nothing in these Terms is intended to exclude or limit liability
              where such exclusion or limitation is prohibited by applicable
              law, including liability that cannot lawfully be excluded or
              limited.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* SECTION 21 */}
      <div className="max-w-4xl mx-auto mt-8">
        <Card className="p-6 rounded-2xl shadow">
          <CardContent>
            <h3 className="text-xl font-semibold mb-3">
              21. Indemnification
            </h3>

            <p className="text-muted-foreground whitespace-pre-line">
              To the maximum extent permitted by applicable law, you agree to
              indemnify and hold harmless Ask Michael, its owners, operators,
              employees, contractors, affiliates, and service providers from
              claims, losses, liabilities, damages, costs, and reasonable
              expenses arising from your unlawful use of the platform, your
              breach of these Terms, your violation of another person's rights,
              your unauthorised submission or use of information, or your
              misuse of the service.

              {"\n\n"}

              This provision does not apply to the extent that the relevant
              loss or claim was caused by conduct for which Ask Michael cannot
              lawfully exclude responsibility.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* SECTION 22 */}
      <div className="max-w-4xl mx-auto mt-8">
        <Card className="p-6 rounded-2xl shadow">
          <CardContent>
            <h3 className="text-xl font-semibold mb-3">
              22. Force Majeure
            </h3>

            <p className="text-muted-foreground whitespace-pre-line">
              Ask Michael will not be responsible for delay, interruption, or
              failure to perform caused by circumstances beyond its reasonable
              control.

              {"\n\n"}

              Such circumstances may include natural disasters, severe
              weather, power failures, internet or telecommunications
              failures, cyber incidents, government action, labour disputes,
              infrastructure failures, failures of third-party service
              providers, war, civil unrest, or other events beyond reasonable
              control.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* SECTION 23 */}
      <div className="max-w-4xl mx-auto mt-8">
        <Card className="p-6 rounded-2xl shadow">
          <CardContent>
            <h3 className="text-xl font-semibold mb-3">
              23. Changes to These Terms
            </h3>

            <p className="text-muted-foreground whitespace-pre-line">
              Ask Michael may update these Terms from time to time to reflect
              changes to the platform, business operations, legal requirements,
              security practices, or services.

              {"\n\n"}

              Where appropriate, material changes may be communicated through
              the platform or other reasonable means.

              {"\n\n"}

              The updated Terms will apply from the effective date stated in
              the revised Terms, subject to applicable law.

              {"\n\n"}

              Where continued use constitutes acceptance under applicable law,
              continued use of the platform after the effective date may
              constitute acceptance of the updated Terms.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* SECTION 24 */}
      <div className="max-w-4xl mx-auto mt-8">
        <Card className="p-6 rounded-2xl shadow">
          <CardContent>
            <h3 className="text-xl font-semibold mb-3">
              24. Governing Law and Disputes
            </h3>

            <p className="text-muted-foreground whitespace-pre-line">
              These Terms are intended to be governed by the laws of the
              Republic of South Africa, subject to any mandatory legal rights
              or protections that apply to a user.

              {"\n\n"}

              Any dispute relating to the platform or these Terms should first
              be raised with Ask Michael so that the parties have a reasonable
              opportunity to attempt to resolve the matter.

              {"\n\n"}

              Nothing in this section prevents a person from exercising a
              mandatory right, remedy, complaint procedure, or dispute
              resolution mechanism available under applicable law.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* SECTION 25 */}
      <div className="max-w-4xl mx-auto mt-8">
        <Card className="p-6 rounded-2xl shadow">
          <CardContent>
            <h3 className="text-xl font-semibold mb-3">
              25. Severability
            </h3>

            <p className="text-muted-foreground whitespace-pre-line">
              If any provision of these Terms is found to be unlawful,
              invalid, or unenforceable, that provision will be interpreted or
              limited to the minimum extent necessary to make it enforceable,
              where legally permitted.

              {"\n\n"}

              If it cannot be made enforceable, the affected provision will be
              severed to the extent necessary, and the remaining provisions
              will continue to apply to the extent permitted by law.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* SECTION 26 */}
      <div className="max-w-4xl mx-auto mt-8">
        <Card className="p-6 rounded-2xl shadow">
          <CardContent>
            <h3 className="text-xl font-semibold mb-3">
              26. Entire Agreement
            </h3>

            <p className="text-muted-foreground whitespace-pre-line">
              These Terms, together with any applicable subscription
              information, order terms, partner agreements, Privacy Policy,
              and other terms expressly incorporated by reference, form the
              agreement governing your use of Ask Michael, subject to any
              separate written agreement between Ask Michael and a partner or
              customer.

              {"\n\n"}

              If a separate written agreement expressly conflicts with these
              Terms, the applicable written agreement will govern to the extent
              of the conflict.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* SECTION 27 */}
      <div className="max-w-4xl mx-auto mt-8">
        <Card className="p-6 rounded-2xl shadow">
          <CardContent>
            <h3 className="text-xl font-semibold mb-3">
              27. No Waiver
            </h3>

            <p className="text-muted-foreground whitespace-pre-line">
              If Ask Michael does not immediately enforce a provision of these
              Terms, that does not mean Ask Michael has waived its right to
              enforce that provision later.

              {"\n\n"}

              Any waiver must be considered in the context in which it is
              given and does not automatically constitute a continuing waiver
              of future breaches.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* IMPORTANT NOTICE */}
      <div className="max-w-4xl mx-auto mt-24">
        <Card className="p-6 rounded-2xl border">
          <CardContent>
            <h3 className="text-xl font-semibold mb-3">
              Important AI and Engineering Notice
            </h3>

            <p className="text-muted-foreground whitespace-pre-line">
              Ask Michael is an AI-assisted platform and should not be treated
              as an autonomous engineering authority.

              {"\n\n"}

              AI-generated content may be incorrect, incomplete, outdated, or
              unsuitable for a particular application.

              {"\n\n"}

              Users and partners must independently verify important information
              before relying upon it, particularly where output could affect
              safety, equipment integrity, personnel, production, compliance,
              financial decisions, engineering work, welding, fabrication,
              repairs, maintenance, or other real-world activities.

              {"\n\n"}

              No AI-generated response should be treated as approval,
              certification, inspection, engineering sign-off, legal advice,
              safety approval, regulatory approval, or professional
              certification.

              {"\n\n"}

              The final decision to use, modify, approve, reject, implement, or
              rely upon any information or generated content remains with the
              user and/or the appropriately qualified person or organisation
              responsible for the relevant work.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* CONTACT */}
      <div className="max-w-4xl mx-auto mt-8">
        <Card className="p-6 rounded-2xl shadow">
          <CardContent>
            <h3 className="text-xl font-semibold mb-3">
              28. Contact
            </h3>

            <p className="text-muted-foreground whitespace-pre-line">
              If you have questions regarding these Terms and Conditions,
              account access, subscriptions, or the Ask Michael platform,
              please contact Ask Michael through the contact details provided
              on the platform or official website.

              {"\n\n"}

              Please retain a copy of these Terms for your records.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* CTA */}
      <div className="text-center mt-24">
        <h3 className="text-3xl font-semibold mb-4">
          Start Using the Platform
        </h3>

        <p className="text-muted-foreground mb-6">
          Access AI-assisted tools designed to support your workflows
          responsibly.
        </p>

        <div className="flex justify-center gap-4">
          <Link href="/portal">
            <Button size="lg">Start Free</Button>
          </Link>

          <Link href="/pricing">
            <Button variant="outline" size="lg">
              View Pricing
            </Button>
          </Link>
        </div>
      </div>

    </div>
  );
}